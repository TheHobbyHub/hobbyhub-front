import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import SeletorHorario from '../components/SeletorHorario';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores } from '../theme';
import { formatarDiaMes } from '../utils/formatters';
import {
  getUsuarioLogadoId,
  buscarAula,
  listarHorarios,
  buscarResumoAssinatura,
  agendarAula,
  extrairMensagemErro,
} from '../services/api';

export default function AgendarAulaScreen({ navigation, route }) {
  const { aulaId, dataInicial, horarioId: horarioInicial } = route.params;

  const [usuarioId, setUsuarioId] = useState(null);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [data, setData] = useState(dataInicial);
  const [horarioId, setHorarioId] = useState(horarioInicial);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const id = await getUsuarioLogadoId();
      setUsuarioId(id);
      const [aula, horarios, resumo] = await Promise.all([
        buscarAula(aulaId, id),
        listarHorarios(aulaId),
        buscarResumoAssinatura(id),
      ]);
      setDados({ aula, horarios, resumo });
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar os horários.'));
    }
  }, [aulaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const selecionarData = (novaData) => {
    setData(novaData);
    setHorarioId(undefined);
  };

  const confirmar = async () => {
    if (!horarioId) return;
    setEnviando(true);
    try {
      const agendamento = await agendarAula(usuarioId, horarioId);
      navigation.navigate('AulaAgendada', {
        agendamento,
        planoNome: dados.resumo.planoNome,
        saldoRestante: Math.max(0, (dados.resumo.saldoCreditos ?? 1) - agendamento.creditosPagos),
      });
      // Tira o fluxo de agendamento da pilha: ao voltar para a aba, o usuário cai na tela inicial dela
      navigation.popToTop();
    } catch (e) {
      Alert.alert('Não foi possível agendar', extrairMensagemErro(e, 'Tente novamente em instantes.'));
      setHorarioId(undefined);
      carregar();
    } finally {
      setEnviando(false);
    }
  };

  const conteudo = () => {
    if (erro && !dados) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!dados) return <Carregando />;

    const { aula, horarios, resumo } = dados;
    const incluso = aula.inclusoNoPlano === true;
    const saldo = resumo.saldoCreditos ?? 0;
    const temSaldo = saldo >= 1;
    const podeAgendar = incluso && temSaldo && !!horarioId && !enviando;

    return (
      <>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>{aula.titulo}</Text>
          <View style={styles.local}>
            <Ionicons name="storefront-outline" size={16} color={cores.primaria} />
            <Text style={styles.localTexto}>
              {aula.parceiro?.nome} • {aula.parceiro?.endereco?.bairro}
            </Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <SeletorHorario
              horarios={horarios}
              dataSelecionada={data}
              onSelecionarData={selecionarData}
              horarioSelecionadoId={horarioId}
              onSelecionarHorario={setHorarioId}
            />
          </View>

          {!incluso ? (
            <AvisoPlano
              icone="lock-closed-outline"
              titulo="Aula fora do seu plano"
              texto={
                resumo.possuiAssinatura
                  ? `Esta aula está disponível a partir do ${aula.planoMinimo}.`
                  : 'Assine um plano para agendar aulas.'
              }
              alerta
            />
          ) : !temSaldo ? (
            <AvisoPlano
              icone="alert-circle-outline"
              titulo="Sem créditos neste ciclo"
              texto={`Você já usou todos os créditos do ${resumo.planoNome}. Eles renovam em ${formatarDiaMes(resumo.dataRenovacao)}.`}
              alerta
            />
          ) : (
            <AvisoPlano
              icone="sparkles-outline"
              titulo={`${resumo.planoNome} Ativo`}
              texto={
                <>
                  <Text style={styles.negrito}>1 aula</Text> será debitada da sua assinatura. Restarão{' '}
                  <Text style={styles.negrito}>
                    {saldo - 1} {saldo - 1 === 1 ? 'crédito' : 'créditos'}
                  </Text>{' '}
                  {saldo - 1 === 1 ? 'disponível' : 'disponíveis'} até {formatarDiaMes(resumo.dataRenovacao)}.
                </>
              }
            />
          )}
        </ScrollView>

        <View style={styles.rodape}>
          <TouchableOpacity
            style={[styles.botao, !podeAgendar && styles.botaoDesabilitado]}
            onPress={confirmar}
            disabled={!podeAgendar}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={20} color={podeAgendar ? '#FFF' : cores.textoSuave} />
                <Text style={[styles.botaoTexto, !podeAgendar && { color: cores.textoSuave }]}>
                  {horarioId || !incluso || !temSaldo ? 'Agendar Aula' : 'Escolha um horário'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.rodapeTexto}>Cancelamento gratuito até 24h antes do início</Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Agendar Aula" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

function AvisoPlano({ icone, titulo, texto, alerta }) {
  return (
    <View style={[styles.aviso, alerta && styles.avisoAlerta]}>
      <View style={[styles.avisoIcone, alerta && { backgroundColor: cores.perigo }]}>
        <Ionicons name={icone} size={20} color="#FFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.avisoTitulo, alerta && { color: cores.perigoTexto }]}>{titulo}</Text>
        <Text style={[styles.avisoTexto, alerta && { color: cores.perigoTexto }]}>{texto}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '700', color: cores.secundaria },
  local: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  localTexto: { fontSize: 15, color: cores.textoSecundario },
  negrito: { fontWeight: '700', color: '#2F2670' },
  aviso: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: cores.secundariaClara,
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
  },
  avisoAlerta: { backgroundColor: cores.perigoFundo },
  avisoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.secundaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisoTitulo: { fontSize: 16, fontWeight: '700', color: '#1B075A' },
  avisoTexto: { fontSize: 15, color: '#473B87', lineHeight: 22, marginTop: 2 },
  rodape: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, backgroundColor: cores.fundo },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
  },
  botaoDesabilitado: { backgroundColor: cores.superficieMedia },
  botaoTexto: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  rodapeTexto: { fontSize: 12, color: cores.textoSecundario, textAlign: 'center', marginTop: 8 },
});
