import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { formatarPreco, formatarDiaMes, removerPrefixoPlano } from '../utils/formatters';
import {
  getUsuarioLogadoId,
  listarOpcoesTrocaPlano,
  desistirTrocaPlano,
  extrairMensagemErro,
} from '../services/api';

const ETIQUETA = { ATUAL: 'Plano atual', UPGRADE: 'Upgrade', DOWNGRADE: 'Downgrade', AGENDADO: 'Agendado' };

export default function TrocarPlanoScreen({ navigation, route }) {
  const { dataRenovacao } = route.params;
  const [usuarioId, setUsuarioId] = useState(null);
  const [opcoes, setOpcoes] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const id = await getUsuarioLogadoId();
      const lista = await listarOpcoesTrocaPlano(id);
      setUsuarioId(id);
      setOpcoes(lista);
      // Começa no primeiro plano que dá para escolher, de preferência um upgrade
      const sugestao = lista.find((o) => o.tipo === 'UPGRADE') || lista.find((o) => o.tipo !== 'ATUAL');
      setSelecionado(sugestao?.planoId ?? null);
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar os planos.'));
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atual = opcoes?.find((o) => o.tipo === 'ATUAL');
  const escolhido = opcoes?.find((o) => o.planoId === selecionado);

  const enviar = async (acao, titulo) => {
    setEnviando(true);
    try {
      const resposta = await acao();
      Alert.alert(titulo, resposta?.mensagem, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Não foi possível trocar de plano', extrairMensagemErro(e, 'Tente novamente em instantes.'));
    } finally {
      setEnviando(false);
    }
  };

  const confirmar = () => {
    if (escolhido.tipo === 'AGENDADO') {
      Alert.alert('Desistir da troca', `Você continuará no ${removerPrefixoPlano(atual.nome)} após a renovação.`, [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Desistir da troca', onPress: () => enviar(() => desistirTrocaPlano(usuarioId), 'Troca desfeita') },
      ]);
      return;
    }
    // Upgrade e downgrade passam pela tela de revisão (fora das abas, como as confirmações de aula)
    navigation.navigate('ConfirmarTrocaPlano', { opcao: escolhido, atual, dataRenovacao });
  };

  const conteudo = () => {
    if (erro && !opcoes) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!opcoes) return <Carregando />;

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Escolha seu novo plano</Text>
        <Text style={styles.subtitulo}>
          Upgrades valem na hora: você paga só a diferença pelos dias que faltam no ciclo. Downgrades começam na próxima renovação.
        </Text>

        <View style={styles.lista}>
          {opcoes.map((opcao) => {
            const ehAtual = opcao.tipo === 'ATUAL';
            const ativo = opcao.planoId === selecionado;
            return (
              <TouchableOpacity
                key={opcao.planoId}
                style={[styles.card, ativo && styles.cardSelecionado, ehAtual && styles.cardAtual]}
                onPress={() => setSelecionado(opcao.planoId)}
                disabled={ehAtual}
                activeOpacity={0.85}
              >
                <View style={styles.cardTopo}>
                  <View style={styles.cardNomeArea}>
                    <Text style={styles.cardNome}>{removerPrefixoPlano(opcao.nome)}</Text>
                    <View style={[styles.etiqueta, styles[`etiqueta${opcao.tipo}`]]}>
                      <Text style={[styles.etiquetaTexto, styles[`etiquetaTexto${opcao.tipo}`]]}>{ETIQUETA[opcao.tipo]}</Text>
                    </View>
                  </View>
                  {!ehAtual && (
                    <View style={[styles.radio, ativo && styles.radioAtivo]}>
                      {ativo && <View style={styles.radioMiolo} />}
                    </View>
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPreco}>
                    {formatarPreco(opcao.precoMensal)}
                    <Text style={styles.cardPrecoMes}> /mês</Text>
                  </Text>
                  <Text style={styles.cardCreditos}>{opcao.creditosMensais} aulas por mês</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {escolhido && <Resumo opcao={escolhido} atual={atual} dataRenovacao={dataRenovacao} />}

        <TouchableOpacity
          style={[styles.botao, (!escolhido || enviando) && styles.botaoDesabilitado]}
          onPress={confirmar}
          disabled={!escolhido || enviando}
          activeOpacity={0.85}
        >
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botaoTexto}>
              {!escolhido
                ? 'Selecione um plano'
                : escolhido.tipo === 'UPGRADE'
                  ? `Fazer upgrade • ${formatarPreco(escolhido.valorCobradoHoje)}`
                  : escolhido.tipo === 'AGENDADO'
                    ? 'Desistir da troca'
                    : 'Agendar troca de plano'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Alterar Plano" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

// Explica o que acontece ao escolher o plano selecionado
function Resumo({ opcao, atual, dataRenovacao }) {
  const nome = removerPrefixoPlano(opcao.nome);
  const nomeAtual = removerPrefixoPlano(atual.nome);
  const renovacao = formatarDiaMes(dataRenovacao);

  const itens =
    opcao.tipo === 'UPGRADE'
      ? [
          { icone: 'cash-outline', texto: `Você paga ${formatarPreco(opcao.valorCobradoHoje)} hoje: a diferença de preço proporcional aos dias que faltam até ${renovacao}.` },
          { icone: 'add-circle-outline', texto: `Seu saldo ganha +${opcao.creditosAdicionais} ${opcao.creditosAdicionais === 1 ? 'crédito' : 'créditos'} agora.` },
          { icone: 'calendar-outline', texto: `A partir de ${renovacao}, a mensalidade passa a ser ${formatarPreco(opcao.precoMensal)}.` },
        ]
      : opcao.tipo === 'AGENDADO'
        ? [
            { icone: 'time-outline', texto: `Você já agendou a troca para o ${nome}, que começa em ${renovacao}.` },
            { icone: 'arrow-undo-outline', texto: `Se desistir, você continua no ${nomeAtual} depois da renovação.` },
          ]
        : [
            { icone: 'calendar-outline', texto: `O ${nome} começa em ${renovacao}, com mensalidade de ${formatarPreco(opcao.precoMensal)}.` },
            { icone: 'color-palette-outline', texto: `Até lá, você continua no ${nomeAtual} com os créditos e aulas que já tem.` },
            { icone: 'arrow-undo-outline', texto: `Você pode desistir da troca até ${renovacao}.` },
          ];

  return (
    <View style={styles.resumo}>
      {itens.map((item) => (
        <View key={item.icone} style={styles.resumoItem}>
          <Ionicons name={item.icone} size={20} color={cores.secundaria} />
          <Text style={styles.resumoTexto}>{item.texto}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 14, color: cores.textoSecundario, lineHeight: 21, marginTop: 6 },
  lista: { gap: 12, marginTop: 20 },
  card: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20, borderWidth: 2, borderColor: 'transparent', ...sombra },
  cardSelecionado: { borderColor: cores.primaria, backgroundColor: '#F4F3FF' },
  cardAtual: { backgroundColor: cores.superficieBaixa, shadowOpacity: 0, elevation: 0 },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNomeArea: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  cardNome: { fontSize: 20, fontWeight: '700', color: cores.texto },
  etiqueta: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: cores.superficieMedia },
  etiquetaTexto: { fontSize: 12, fontWeight: '600', color: cores.textoSecundario },
  etiquetaUPGRADE: { backgroundColor: cores.primaria },
  etiquetaTextoUPGRADE: { color: '#FFF' },
  etiquetaAGENDADO: { backgroundColor: cores.secundariaClara },
  etiquetaTextoAGENDADO: { color: cores.secundaria },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: cores.textoSuave, justifyContent: 'center', alignItems: 'center' },
  radioAtivo: { borderColor: cores.primaria },
  radioMiolo: { width: 10, height: 10, borderRadius: 5, backgroundColor: cores.primaria },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 },
  cardPreco: { fontSize: 18, fontWeight: '700', color: cores.primaria },
  cardPrecoMes: { fontSize: 13, fontWeight: '400', color: cores.textoSecundario },
  cardCreditos: { fontSize: 14, color: cores.textoSecundario },
  resumo: { backgroundColor: cores.secundariaClara, borderRadius: 24, padding: 18, gap: 12, marginTop: 20 },
  resumoItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  resumoTexto: { flex: 1, fontSize: 14, color: cores.textoSecundario, lineHeight: 20 },
  botao: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    marginTop: 24,
    ...sombra,
    shadowOpacity: 0.25,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
