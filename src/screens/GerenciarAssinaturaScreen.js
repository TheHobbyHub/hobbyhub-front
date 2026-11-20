import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import FaturaItem from '../components/FaturaItem';
import { Carregando, Erro, Vazio } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { formatarPreco, formatarDataMesAbreviado, formatarDiaMes, removerPrefixoPlano } from '../utils/formatters';
import {
  getUsuarioLogadoId,
  buscarDetalhesAssinatura,
  listarFaturas,
  cancelarAssinatura,
  reativarAssinatura,
  desistirTrocaPlano,
  extrairMensagemErro,
} from '../services/api';

// Quantas faturas aparecem aqui; o restante fica em Histórico de Faturamento
const FATURAS_RESUMO = 2;

export default function GerenciarAssinaturaScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const usuarioId = await getUsuarioLogadoId();
      const [detalhes, faturas] = await Promise.all([buscarDetalhesAssinatura(usuarioId), listarFaturas(usuarioId)]);
      setDados({ usuarioId, detalhes, faturas });
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar sua assinatura.'));
    }
  }, []);

  // Recarrega ao voltar de Trocar Plano / Trocar Cartão
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const onRefresh = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  // Executa uma ação na assinatura, mostra a mensagem da API e recarrega a tela
  const executar = async (acao, tituloSucesso) => {
    setProcessando(true);
    try {
      const resposta = await acao(dados.usuarioId);
      Alert.alert(tituloSucesso, resposta?.mensagem);
      await carregar();
    } catch (e) {
      Alert.alert('Não foi possível concluir', extrairMensagemErro(e, 'Tente novamente em instantes.'));
    } finally {
      setProcessando(false);
    }
  };

  const confirmarCancelamento = () => {
    Alert.alert(
      'Cancelar assinatura',
      `Sua assinatura não será renovada. Você continua com seus créditos e aulas agendadas até ${formatarDiaMes(dados.detalhes.dataRenovacao)}.`,
      [
        { text: 'Manter assinatura', style: 'cancel' },
        { text: 'Cancelar assinatura', style: 'destructive', onPress: () => executar(cancelarAssinatura, 'Assinatura cancelada') },
      ]
    );
  };

  const confirmarDesistencia = () => {
    Alert.alert('Desistir da troca', `Você continuará no ${dados.detalhes.planoNome} após a renovação.`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Desistir da troca', onPress: () => executar(desistirTrocaPlano, 'Troca desfeita') },
    ]);
  };

  const conteudo = () => {
    if (erro && !dados) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!dados) return <Carregando />;

    const { detalhes, faturas } = dados;
    if (!detalhes.possuiAssinatura) {
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Vazio
            icone="star-outline"
            titulo="Você ainda não tem um plano"
            descricao="Assine um plano para ganhar créditos mensais e agendar aulas nos ateliês parceiros."
            acao="Conhecer planos"
            onAcao={() => navigation.navigate('Planos')}
          />
          {faturas.length > 0 && (
            <TouchableOpacity style={styles.linkCentral} onPress={() => navigation.navigate('HistoricoFaturamento')}>
              <Text style={styles.link}>Ver histórico de faturamento</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      );
    }

    const cancelada = detalhes.cancelamentoAgendado;
    const total = detalhes.creditosMensais || 0;
    const saldo = detalhes.saldoCreditos || 0;
    // Depois de um upgrade o saldo pode passar do total do plano anterior; a barra nunca passa de 100%
    const progresso = total ? Math.min(saldo / total, 1) : 0;

    return (
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={cores.primaria} />}
      >
        <View style={styles.cardPlano}>
          <View style={[styles.pill, cancelada && styles.pillCancelada]}>
            <View style={[styles.pillPonto, cancelada && styles.pillPontoCancelada]} />
            <Text style={[styles.pillTexto, cancelada && styles.pillTextoCancelada]}>{cancelada ? 'Cancelada' : 'Plano Ativo'}</Text>
          </View>

          <View style={styles.planoLinha}>
            <Text style={styles.planoNome}>{detalhes.planoNome}</Text>
            <View style={styles.precoArea}>
              <Text style={styles.preco}>{formatarPreco(detalhes.precoMensal)}</Text>
              <Text style={styles.precoMes}>/ mês</Text>
            </View>
          </View>

          <View style={styles.renovacao}>
            <Ionicons name={cancelada ? 'calendar-clear-outline' : 'calendar-outline'} size={16} color={cores.textoSecundario} />
            <Text style={styles.renovacaoTexto}>
              {cancelada ? 'Acesso até ' : 'Próxima renovação em '}
              <Text style={styles.renovacaoData}>{formatarDataMesAbreviado(detalhes.dataRenovacao)}</Text>
            </Text>
          </View>

          <View style={styles.creditos}>
            <View style={styles.creditosTopo}>
              <View style={styles.creditosTitulo}>
                <Ionicons name="color-palette-outline" size={18} color={cores.primaria} />
                <Text style={styles.creditosTexto}>Créditos de Oficinas</Text>
              </View>
              <Text style={styles.creditosValor}>
                {saldo} de {total} {total === 1 ? 'crédito' : 'créditos'} {saldo === 1 ? 'restante' : 'restantes'}
              </Text>
            </View>
            <View style={styles.barra}>
              <View style={[styles.barraPreenchida, { width: `${progresso * 100}%` }]} />
            </View>
          </View>

          {!cancelada && (
            <TouchableOpacity
              style={styles.botaoUpgrade}
              onPress={() => navigation.navigate('TrocarPlano', { dataRenovacao: detalhes.dataRenovacao })}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoUpgradeTexto}>Alterar ou Fazer Upgrade</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {!cancelada && detalhes.planoAgendadoNome && (
          <View style={styles.aviso}>
            <Ionicons name="swap-vertical-outline" size={20} color={cores.secundaria} />
            <View style={styles.avisoTextos}>
              <Text style={styles.avisoTexto}>
                Seu plano muda para o <Text style={styles.negrito}>{removerPrefixoPlano(detalhes.planoAgendadoNome)}</Text> em{' '}
                {formatarDiaMes(detalhes.dataRenovacao)}. Até lá, você continua com o {removerPrefixoPlano(detalhes.planoNome)}.
              </Text>
              <TouchableOpacity onPress={confirmarDesistencia} disabled={processando} hitSlop={8}>
                <Text style={styles.link}>Desistir da troca</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TituloSecao icone="card-outline" titulo="Forma de Pagamento" />
        <View style={styles.card}>
          <View style={styles.linha}>
            <View style={styles.iconeGrande}>
              <Ionicons name="card" size={24} color={cores.primaria} />
            </View>
            <View style={styles.linhaTextos}>
              {detalhes.cartao ? (
                <>
                  <Text style={styles.linhaTitulo}>Cartão •••• {detalhes.cartao.ultimosDigitos}</Text>
                  <Text style={styles.linhaDescricao} numberOfLines={1}>
                    {detalhes.cartao.nomeTitular} • Expira em {detalhes.cartao.validade}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.linhaTitulo}>Nenhum cartão cadastrado</Text>
                  <Text style={styles.linhaDescricao}>Necessário para upgrades</Text>
                </>
              )}
            </View>
            <TouchableOpacity
              style={styles.botaoTrocar}
              onPress={() => navigation.navigate('TrocarCartao', { cartaoAtual: detalhes.cartao })}
              activeOpacity={0.8}
            >
              <Text style={styles.botaoTrocarTexto}>{detalhes.cartao ? 'Trocar' : 'Adicionar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TituloSecao icone="receipt-outline" titulo="Histórico de Faturamento" />
        <View style={styles.card}>
          {faturas.length === 0 ? (
            <Text style={styles.semFaturas}>Nenhuma fatura registrada ainda.</Text>
          ) : (
            <>
              {faturas.slice(0, FATURAS_RESUMO).map((fatura) => (
                <FaturaItem key={fatura.id} fatura={fatura} />
              ))}
              <TouchableOpacity style={styles.linkCentral} onPress={() => navigation.navigate('HistoricoFaturamento')}>
                <Text style={styles.link}>Ver histórico completo</Text>
                <Ionicons name="chevron-forward" size={16} color={cores.primaria} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <TituloSecao icone="options-outline" titulo="Preferências do Plano" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linha}
            onPress={() => navigation.navigate('PreferenciasPlano', { dataRenovacao: detalhes.dataRenovacao })}
            activeOpacity={0.7}
          >
            <View style={styles.iconeMedio}>
              <Ionicons name="help-circle-outline" size={22} color={cores.secundaria} />
            </View>
            <View style={styles.linhaTextos}>
              <Text style={styles.linhaTitulo}>Regras de cancelamento e créditos</Text>
              <Text style={styles.linhaDescricao}>Entenda como funciona o ciclo mensal, a troca de plano e os agendamentos.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.textoSecundario} />
          </TouchableOpacity>
        </View>

        {cancelada ? (
          <>
            <TouchableOpacity
              style={styles.botaoReativar}
              onPress={() => executar(reativarAssinatura, 'Assinatura reativada')}
              disabled={processando}
              activeOpacity={0.85}
            >
              {processando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#FFF" />
                  <Text style={styles.botaoReativarTexto}>Reativar assinatura</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.rodape}>
              Sua assinatura termina em <Text style={styles.negrito}>{formatarDiaMes(detalhes.dataRenovacao)}</Text> e não será renovada. Até
              lá, seus créditos e aulas agendadas continuam valendo.
            </Text>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.botaoCancelar} onPress={confirmarCancelamento} disabled={processando} activeOpacity={0.8}>
              {processando ? (
                <ActivityIndicator color={cores.perigoTexto} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color={cores.perigoTexto} />
                  <Text style={styles.botaoCancelarTexto}>Cancelar assinatura</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.rodape}>
              Você continuará com acesso irrestrito aos seus créditos e oficinas agendadas até o fim do ciclo atual em{' '}
              <Text style={styles.negrito}>{formatarDiaMes(detalhes.dataRenovacao)}</Text>.
            </Text>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Gerenciar Assinatura" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

function TituloSecao({ icone, titulo }) {
  return (
    <View style={styles.tituloSecao}>
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <Text style={styles.tituloSecaoTexto}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  negrito: { fontWeight: '700', color: cores.texto },

  cardPlano: { backgroundColor: cores.superficie, borderRadius: 32, padding: 24, ...sombra },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: cores.secundariaClara,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillCancelada: { backgroundColor: cores.perigoFundo },
  pillPonto: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.secundaria },
  pillPontoCancelada: { backgroundColor: cores.perigoTexto },
  pillTexto: { fontSize: 13, fontWeight: '600', color: cores.secundaria },
  pillTextoCancelada: { color: cores.perigoTexto },
  planoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16, gap: 12 },
  planoNome: { flex: 1, fontSize: 28, fontWeight: '700', color: cores.texto },
  precoArea: { alignItems: 'flex-end' },
  preco: { fontSize: 22, fontWeight: '700', color: cores.primaria },
  precoMes: { fontSize: 13, color: cores.textoSecundario },
  renovacao: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  renovacaoTexto: { fontSize: 14, color: cores.textoSecundario },
  renovacaoData: { fontWeight: '700', color: cores.texto },
  creditos: { backgroundColor: cores.superficieBaixa, borderRadius: 24, padding: 18, marginTop: 20 },
  // Em telas estreitas o contador desce para a linha de baixo em vez de espremer o título
  creditosTopo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 8, rowGap: 4 },
  creditosTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  creditosTexto: { fontSize: 14, fontWeight: '600', color: cores.texto },
  creditosValor: { fontSize: 14, fontWeight: '700', color: cores.primaria },
  barra: { height: 10, borderRadius: 5, backgroundColor: cores.superficieMedia, marginTop: 12, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 5, backgroundColor: cores.primaria },
  botaoUpgrade: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    marginTop: 22,
    ...sombra,
    shadowOpacity: 0.25,
  },
  botaoUpgradeTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  aviso: { flexDirection: 'row', gap: 12, backgroundColor: cores.secundariaClara, borderRadius: 24, padding: 18, marginTop: 16 },
  avisoTextos: { flex: 1, gap: 8 },
  avisoTexto: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20 },

  tituloSecao: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 12 },
  tituloSecaoTexto: { fontSize: 20, fontWeight: '600', color: cores.texto },
  card: { backgroundColor: cores.superficie, borderRadius: 32, paddingHorizontal: 20, paddingVertical: 10, ...sombra },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 14 },
  linhaTextos: { flex: 1 },
  linhaTitulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  linhaDescricao: { fontSize: 13, color: cores.textoSecundario, marginTop: 2, lineHeight: 18 },
  iconeGrande: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.primariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconeMedio: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTrocar: { backgroundColor: cores.superficieMedia, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  botaoTrocarTexto: { fontSize: 14, fontWeight: '600', color: cores.primaria },
  semFaturas: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center', paddingVertical: 16 },
  linkCentral: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 4, paddingVertical: 12 },
  link: { fontSize: 14, fontWeight: '600', color: cores.primaria },

  botaoCancelar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.perigoFundo,
    borderRadius: 999,
    height: 56,
    marginTop: 32,
  },
  botaoCancelarTexto: { fontSize: 16, fontWeight: '600', color: cores.perigoTexto },
  botaoReativar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 56,
    marginTop: 32,
  },
  botaoReativarTexto: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  rodape: { fontSize: 13, color: cores.textoSecundario, textAlign: 'center', lineHeight: 20, marginTop: 14, paddingHorizontal: 8 },
});
