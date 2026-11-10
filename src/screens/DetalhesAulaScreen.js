import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AulaImagem from '../components/AulaImagem';
import ScreenHeader from '../components/ScreenHeader';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import {
  parseData,
  diaSemanaCurto,
  formatarHora,
  formatarMesAno,
  formatarDuracaoLonga,
  removerPrefixoPlano,
} from '../utils/formatters';
import {
  getUsuarioLogadoId,
  buscarAula,
  listarHorarios,
  buscarResumoAssinatura,
  extrairMensagemErro,
} from '../services/api';

const QTD_PROXIMOS_HORARIOS = 4;

export default function DetalhesAulaScreen({ navigation, route }) {
  const { aulaId } = route.params;
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const usuarioId = await getUsuarioLogadoId();
      const [aula, horarios, resumo] = await Promise.all([
        buscarAula(aulaId, usuarioId),
        listarHorarios(aulaId),
        buscarResumoAssinatura(usuarioId),
      ]);
      setDados({ aula, horarios, resumo });
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar os detalhes da aula.'));
    }
  }, [aulaId]);

  // Recarrega ao voltar do agendamento, para as vagas ficarem atualizadas
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const conteudo = () => {
    if (erro && !dados) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!dados) return <Carregando />;

    const { aula, horarios, resumo } = dados;
    const incluso = aula.inclusoNoPlano === true;
    const proximos = horarios.slice(0, QTD_PROXIMOS_HORARIOS);
    const endereco = aula.parceiro?.endereco;

    const abrirAgendamento = (horario) =>
      navigation.navigate('AgendarAula', {
        aulaId,
        dataInicial: horario?.data,
        horarioId: horario?.disponivel ? horario.id : undefined,
      });

    return (
      <>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <AulaImagem uri={aula.imagemUrl} categoria={aula.categoria} style={styles.imagem} iconSize={80} />

          <Text style={styles.titulo}>{aula.titulo}</Text>
          <View style={styles.meta}>
            <Ionicons name="location" size={17} color={cores.primaria} />
            <Text style={styles.metaParceiro}>{aula.parceiro?.nome}</Text>
            <View style={styles.metaPonto} />
            <Ionicons name="time-outline" size={17} color={cores.textoSecundario} />
            <Text style={styles.metaTexto}>{formatarDuracaoLonga(aula.duracaoMinutos)}</Text>
          </View>

          {incluso ? (
            <View style={styles.statusIncluso}>
              <View style={styles.statusIcone}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitulo}>Incluso no seu {resumo.planoNome}</Text>
                <Text style={styles.statusTexto}>Consome 1 crédito mensal</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillTexto}>Ativo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.statusBloqueado}>
              <View style={styles.statusLinha}>
                <View style={[styles.statusIcone, { backgroundColor: cores.secundaria }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bloqueadoTitulo}>
                    {aula.planoMinimo ? `Exclusivo do ${aula.planoMinimo}` : 'Não incluso no seu plano'}
                  </Text>
                  <Text style={styles.bloqueadoTexto}>
                    {!aula.planoMinimo
                      ? 'Esta aula ainda não está disponível em nenhum plano.'
                      : resumo.possuiAssinatura
                        ? `Disponível a partir do ${aula.planoMinimo}. Faça o upgrade para ter acesso a esta aula.`
                        : `Disponível a partir do ${aula.planoMinimo}. Assine um plano para agendar esta aula.`}
                  </Text>
                </View>
              </View>
              <View style={styles.divisor} />
              <TouchableOpacity style={styles.botaoUpgrade} onPress={() => navigation.navigate('Planos')}>
                <Ionicons name="star-outline" size={16} color="#FFF" />
                <Text style={styles.botaoUpgradeTexto}>
                  {resumo.possuiAssinatura ? 'Ver planos de upgrade' : 'Conhecer planos'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tags}>
            {aula.subcategoria && (
              <View style={[styles.tag, { backgroundColor: cores.secundariaClara }]}>
                <Text style={styles.tagTexto}>{aula.subcategoria}</Text>
              </View>
            )}
            {aula.nivel && (
              <View style={[styles.tag, { backgroundColor: cores.superficieMedia }]}>
                <Text style={styles.tagTexto}>Nível {aula.nivel}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTituloLinha}>
              <Ionicons name="color-palette-outline" size={22} color={cores.secundaria} />
              <Text style={styles.cardTitulo}>Sobre a aula</Text>
            </View>
            <Text style={styles.cardTexto}>{aula.descricao}</Text>
          </View>

          {aula.instrutor && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Instrutor(a)</Text>
              <View style={styles.instrutor}>
                {aula.instrutor.fotoUrl ? (
                  <Image source={{ uri: aula.instrutor.fotoUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarIniciais]}>
                    <Text style={styles.avatarTexto}>
                      {aula.instrutor.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={styles.instrutorNome}>{aula.instrutor.nome}</Text>
                  <Text style={styles.instrutorEspecialidade}>{aula.instrutor.especialidade}</Text>
                </View>
              </View>
            </View>
          )}

          {endereco && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Localização</Text>
              <Text style={[styles.cardTexto, { fontSize: 14, marginTop: 8 }]}>
                {endereco.logradouro}, {endereco.numero}
                {endereco.complemento ? ` (${endereco.complemento})` : ''} — {endereco.bairro}, {endereco.cidade} -{' '}
                {endereco.estado}
              </Text>
            </View>
          )}

          <View style={styles.horariosHeader}>
            <View style={styles.horariosTituloLinha}>
              <Text style={styles.horariosTitulo}>Próximos horários</Text>
              {!incluso && <Ionicons name="lock-closed-outline" size={16} color={cores.secundaria} />}
            </View>
            {proximos.length > 0 && (incluso || aula.planoMinimo) && (
              <Text style={styles.horariosMes}>
                {incluso ? formatarMesAno(proximos[0].data) : `Exclusivo ${removerPrefixoPlano(aula.planoMinimo)}`}
              </Text>
            )}
          </View>

          {proximos.length === 0 ? (
            <Text style={styles.semHorarios}>Nenhum horário programado no momento.</Text>
          ) : (
            <View style={styles.horarios}>
              {proximos.map((horario, indice) => {
                const destaque = indice === 0 && horario.disponivel;
                return (
                  <TouchableOpacity
                    key={horario.id}
                    style={[styles.horario, destaque && styles.horarioDestaque, !horario.disponivel && styles.horarioLotado]}
                    disabled={!incluso}
                    onPress={() => abrirAgendamento(horario)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.horarioDia, destaque && styles.horarioTextoDestaque]}>
                      {diaSemanaCurto(horario.data).toUpperCase()}
                    </Text>
                    <Text style={[styles.horarioNumero, destaque && styles.horarioTextoDestaque]}>
                      {parseData(horario.data).getDate()}
                    </Text>
                    <Text style={[styles.horarioHora, destaque && styles.horarioTextoDestaque]}>
                      {horario.disponivel ? formatarHora(horario.horaInicio).replace('h', ':') : 'Lotado'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.rodape}>
          {incluso ? (
            <TouchableOpacity
              style={[styles.botaoPrincipal, horarios.length === 0 && styles.botaoDesabilitado]}
              onPress={() => abrirAgendamento()}
              disabled={horarios.length === 0}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={20} color={horarios.length === 0 ? cores.textoSuave : '#FFF'} />
              <Text style={[styles.botaoPrincipalTexto, horarios.length === 0 && { color: cores.textoSuave }]}>
                Conferir Disponibilidade
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.botaoPrincipal, styles.botaoDesabilitado]}>
              <Ionicons name="ban-outline" size={20} color={cores.textoSuave} />
              <Text style={[styles.botaoPrincipalTexto, { color: cores.textoSuave }]}>Aula não disponível no seu plano</Text>
            </View>
          )}
          <Text style={styles.rodapeTexto}>
            {incluso ? 'Cancelamento gratuito até 24h antes do início' : 'Cancele ou altere seu plano quando quiser sem fidelidade.'}
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Detalhes da Aula" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  imagem: { height: 290, borderRadius: 32, marginTop: 4 },
  titulo: { fontSize: 28, fontWeight: '700', color: cores.secundaria, marginTop: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  metaParceiro: { fontSize: 15, fontWeight: '600', color: cores.texto },
  metaPonto: { width: 5, height: 5, borderRadius: 3, backgroundColor: cores.borda, marginHorizontal: 4 },
  metaTexto: { fontSize: 15, color: cores.textoSecundario },

  statusIncluso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F1EFFD',
    borderWidth: 1,
    borderColor: '#D9D5F3',
    borderRadius: 999,
    padding: 12,
    marginTop: 18,
  },
  statusIcone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  statusTexto: { fontSize: 12, color: cores.textoSecundario },
  statusPill: { backgroundColor: cores.primariaClara, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  statusPillTexto: { fontSize: 13, fontWeight: '600', color: cores.primaria },
  statusBloqueado: {
    backgroundColor: '#F1EFFD',
    borderWidth: 1,
    borderColor: '#D9D5F3',
    borderRadius: 28,
    padding: 18,
    marginTop: 18,
  },
  statusLinha: { flexDirection: 'row', gap: 12 },
  bloqueadoTitulo: { fontSize: 15, fontWeight: '700', color: cores.secundaria },
  bloqueadoTexto: { fontSize: 13, color: cores.textoSecundario, lineHeight: 19, marginTop: 2 },
  divisor: { height: 1, backgroundColor: '#DCD8F0', marginVertical: 12 },
  botaoUpgrade: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  botaoUpgradeTexto: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  tag: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  tagTexto: { fontSize: 13, fontWeight: '500', color: cores.texto },

  card: { backgroundColor: cores.superficie, borderRadius: 28, padding: 24, marginTop: 20, ...sombra },
  cardTituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitulo: { fontSize: 20, fontWeight: '500', color: cores.secundaria },
  cardTexto: { fontSize: 16, color: cores.textoSecundario, lineHeight: 26, marginTop: 6 },
  instrutor: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarIniciais: { backgroundColor: cores.secundariaClara, justifyContent: 'center', alignItems: 'center' },
  avatarTexto: { fontSize: 20, fontWeight: '700', color: cores.secundaria },
  instrutorNome: { fontSize: 17, fontWeight: '600', color: cores.texto },
  instrutorEspecialidade: { fontSize: 14, color: cores.textoSecundario },

  horariosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  horariosTituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  horariosTitulo: { fontSize: 20, fontWeight: '500', color: cores.texto },
  horariosMes: { fontSize: 14, fontWeight: '600', color: cores.primaria },
  semHorarios: { fontSize: 14, color: cores.textoSecundario, marginTop: 12 },
  horarios: { flexDirection: 'row', gap: 10, marginTop: 14 },
  horario: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  horarioDestaque: { backgroundColor: cores.primaria },
  horarioLotado: { opacity: 0.5 },
  horarioDia: { fontSize: 13, color: cores.textoSecundario },
  horarioNumero: { fontSize: 24, fontWeight: '700', color: cores.texto, marginVertical: 2 },
  horarioHora: { fontSize: 14, color: cores.texto },
  horarioTextoDestaque: { color: '#FFF' },

  rodape: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, backgroundColor: cores.fundo },
  botaoPrincipal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 58,
  },
  botaoDesabilitado: { backgroundColor: cores.superficieMedia },
  botaoPrincipalTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  rodapeTexto: { fontSize: 12, color: cores.textoSecundario, textAlign: 'center', marginTop: 8 },
});
