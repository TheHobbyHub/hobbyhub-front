import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import SeletorHorario from '../components/SeletorHorario';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores } from '../theme';
import { formatarDataCurta, formatarIntervalo } from '../utils/formatters';
import { getUsuarioLogadoId, listarHorarios, reagendarAula, extrairMensagemErro } from '../services/api';

export default function ReagendarAulaScreen({ navigation, route }) {
  const { agendamento } = route.params;
  const endereco = agendamento.parceiro?.endereco;

  const [horarios, setHorarios] = useState(null);
  const [erro, setErro] = useState(null);
  const [data, setData] = useState(agendamento.data);
  const [horarioId, setHorarioId] = useState(undefined);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setHorarios(await listarHorarios(agendamento.aulaId));
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar os horários.'));
    }
  }, [agendamento.aulaId]);

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
      const usuarioId = await getUsuarioLogadoId();
      const atualizado = await reagendarAula(agendamento.id, usuarioId, horarioId);
      Alert.alert(
        'Aula reagendada!',
        `Sua aula foi remarcada para ${formatarDataCurta(atualizado.data)}, ${formatarIntervalo(atualizado.horaInicio, atualizado.horaFim)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Não foi possível reagendar', extrairMensagemErro(e, 'Tente novamente em instantes.'));
      setHorarioId(undefined);
      carregar();
    } finally {
      setEnviando(false);
    }
  };

  const podeConfirmar = !!horarioId && !enviando;

  const conteudo = () => {
    if (erro && !horarios) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!horarios) return <Carregando />;

    return (
      <>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>{agendamento.titulo}</Text>
          <View style={styles.local}>
            <Ionicons name="location-outline" size={17} color={cores.primaria} />
            <Text style={styles.localTexto} numberOfLines={2}>
              {agendamento.parceiro?.nome}
              {endereco ? ` • ${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}` : ''}
            </Text>
          </View>

          <View style={styles.atual}>
            <View style={styles.atualTopo}>
              <View style={styles.atualRotulo}>
                <Ionicons name="calendar-outline" size={18} color={cores.secundaria} />
                <Text style={styles.atualRotuloTexto}>AGENDAMENTO ATUAL</Text>
              </View>
              <View style={styles.confirmado}>
                <Text style={styles.confirmadoTexto}>Confirmado</Text>
              </View>
            </View>
            <View style={styles.atualInfo}>
              <View style={styles.atualColuna}>
                <View style={styles.atualIcone}>
                  <Ionicons name="calendar-outline" size={18} color={cores.secundaria} />
                </View>
                <View>
                  <Text style={styles.atualLegenda}>Data</Text>
                  <Text style={styles.atualValor}>{formatarDataCurta(agendamento.data)}</Text>
                </View>
              </View>
              <View style={styles.atualDivisor} />
              <View style={styles.atualColuna}>
                <View style={styles.atualIcone}>
                  <Ionicons name="time-outline" size={18} color={cores.secundaria} />
                </View>
                <View>
                  <Text style={styles.atualLegenda}>Horário</Text>
                  <Text style={styles.atualValor}>{formatarIntervalo(agendamento.horaInicio, agendamento.horaFim)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <SeletorHorario
              horarios={horarios}
              dataSelecionada={data}
              onSelecionarData={selecionarData}
              horarioSelecionadoId={horarioId}
              onSelecionarHorario={setHorarioId}
              horarioAtualId={agendamento.horarioId}
              rotuloData="Selecione a data"
            />
          </View>

          <View style={styles.gratuito}>
            <View style={styles.gratuitoIcone}>
              <Ionicons name="swap-horizontal" size={22} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gratuitoTitulo}>Reagendamento Gratuito</Text>
              <Text style={styles.gratuitoTexto}>O horário anterior será liberado automaticamente após a confirmação.</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.rodape}>
          <TouchableOpacity
            style={[styles.botao, !podeConfirmar && styles.botaoDesabilitado]}
            onPress={confirmar}
            disabled={!podeConfirmar}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={20} color={podeConfirmar ? '#FFF' : cores.textoSuave} />
                <Text style={[styles.botaoTexto, !podeConfirmar && { color: cores.textoSuave }]}>
                  {horarioId ? 'Confirmar Reagendamento' : 'Escolha um novo horário'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.rodapeTexto}>Cancelamento ou alteração gratuita com até 24h de antecedência.</Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Reagendar Aula" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '700', color: cores.secundaria },
  local: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  localTexto: { flex: 1, fontSize: 15, color: cores.textoSecundario },

  atual: {
    backgroundColor: '#F1EFFD',
    borderWidth: 1.5,
    borderColor: '#D9D5F3',
    borderRadius: 24,
    padding: 16,
    marginTop: 20,
  },
  atualTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  atualRotulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  atualRotuloTexto: { fontSize: 13, fontWeight: '600', color: cores.secundaria, letterSpacing: 0.3 },
  confirmado: {
    borderWidth: 1,
    borderColor: '#C9C2EE',
    backgroundColor: cores.superficie,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  confirmadoTexto: { fontSize: 13, color: cores.secundaria },
  atualInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  atualColuna: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  atualDivisor: { width: 1, height: 36, backgroundColor: cores.borda, marginHorizontal: 8 },
  atualIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1EFFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  atualLegenda: { fontSize: 12, color: cores.textoSecundario },
  atualValor: { fontSize: 14, fontWeight: '600', color: cores.texto },

  gratuito: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: cores.superficieBaixa,
    borderWidth: 1,
    borderColor: '#E3E0F5',
    borderRadius: 24,
    padding: 18,
    marginTop: 8,
  },
  gratuitoIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.secundaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gratuitoTitulo: { fontSize: 17, fontWeight: '600', color: cores.secundaria },
  gratuitoTexto: { fontSize: 14, color: cores.textoSecundario, lineHeight: 21, marginTop: 2 },

  rodape: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, backgroundColor: cores.fundo },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.secundaria,
    borderRadius: 999,
    height: 60,
  },
  botaoDesabilitado: { backgroundColor: cores.superficieMedia },
  botaoTexto: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  rodapeTexto: { fontSize: 12, color: cores.textoSecundario, textAlign: 'center', marginTop: 8 },
});
