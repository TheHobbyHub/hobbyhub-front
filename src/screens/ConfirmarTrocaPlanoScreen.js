import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, sombra } from '../theme';
import { formatarPreco, formatarDiaMes, removerPrefixoPlano } from '../utils/formatters';
import { getUsuarioLogadoId, trocarPlano, extrairMensagemErro } from '../services/api';

// Revisão antes de trocar de plano. opcao vem de /opcoes-troca (tipo UPGRADE ou DOWNGRADE)
export default function ConfirmarTrocaPlanoScreen({ navigation, route }) {
  const { opcao, atual, dataRenovacao } = route.params;
  const [enviando, setEnviando] = useState(false);
  const upgrade = opcao.tipo === 'UPGRADE';
  const nome = removerPrefixoPlano(opcao.nome);
  const nomeAtual = removerPrefixoPlano(atual.nome);
  const renovacao = formatarDiaMes(dataRenovacao);

  const confirmar = async () => {
    setEnviando(true);
    try {
      const usuarioId = await getUsuarioLogadoId();
      await trocarPlano(usuarioId, opcao.planoId);
      navigation.replace('TrocaPlanoConcluida', { opcao, atualNome: atual.nome, dataRenovacao });
    } catch (e) {
      Alert.alert('Não foi possível trocar de plano', extrairMensagemErro(e, 'Tente novamente em instantes.'));
      setEnviando(false);
    }
  };

  const itens = upgrade
    ? [
        {
          icone: 'cash-outline',
          titulo: `${formatarPreco(opcao.valorCobradoHoje)} cobrados hoje`,
          texto: `É a diferença de preço proporcional aos dias que faltam até ${renovacao}, cobrada no seu cartão.`,
        },
        {
          icone: 'add-circle-outline',
          titulo: `+${opcao.creditosAdicionais} ${opcao.creditosAdicionais === 1 ? 'crédito' : 'créditos'} agora`,
          texto: `O ${nome} começa na hora e seu saldo ganha a diferença de créditos entre os planos.`,
        },
        {
          icone: 'calendar-outline',
          titulo: `${formatarPreco(opcao.precoMensal)}/mês a partir de ${renovacao}`,
          texto: 'A data de renovação continua a mesma.',
        },
      ]
    : [
        {
          icone: 'calendar-outline',
          titulo: `Começa em ${renovacao}`,
          texto: `Até lá, você continua no ${nomeAtual} com os créditos e aulas que já tem. Nada é cobrado agora.`,
        },
        {
          icone: 'cash-outline',
          titulo: `${formatarPreco(opcao.precoMensal)}/mês`,
          texto: `Valor cobrado a partir da renovação, com ${opcao.creditosMensais} ${opcao.creditosMensais === 1 ? 'crédito' : 'créditos'} por mês.`,
        },
        {
          icone: 'arrow-undo-outline',
          titulo: 'Dá para desistir',
          texto: `Você pode desfazer a troca em Gerenciar Assinatura até ${renovacao}.`,
        },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>{upgrade ? 'Confirmar upgrade?' : 'Confirmar downgrade?'}</Text>
        <Text style={styles.subtitulo}>Confira o que muda antes de trocar de plano.</Text>

        <View style={styles.comparacao}>
          <PlanoResumo rotulo="Plano atual" nome={nomeAtual} preco={atual.precoMensal} creditos={atual.creditosMensais} />
          <View style={styles.seta}>
            <Ionicons name="arrow-down" size={20} color={cores.primaria} />
          </View>
          <PlanoResumo rotulo="Novo plano" nome={nome} preco={opcao.precoMensal} creditos={opcao.creditosMensais} destaque />
        </View>

        <View style={styles.detalhes}>
          {itens.map((item) => (
            <View key={item.icone} style={styles.item}>
              <View style={styles.itemIcone}>
                <Ionicons name={item.icone} size={20} color={cores.secundaria} />
              </View>
              <View style={styles.itemTextos}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                <Text style={styles.itemTexto}>{item.texto}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity style={[styles.botaoConfirmar, enviando && styles.desabilitado]} onPress={confirmar} disabled={enviando} activeOpacity={0.85}>
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color="#FFF" />
              <Text style={styles.botaoConfirmarTexto}>
                {upgrade ? `Confirmar upgrade • ${formatarPreco(opcao.valorCobradoHoje)}` : 'Confirmar downgrade'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()} disabled={enviando}>
          <Ionicons name="arrow-back" size={18} color={cores.secundaria} />
          <Text style={styles.botaoVoltarTexto}>Manter o {nomeAtual}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PlanoResumo({ rotulo, nome, preco, creditos, destaque }) {
  return (
    <View style={[styles.plano, destaque && styles.planoDestaque]}>
      <Text style={[styles.planoRotulo, destaque && styles.planoRotuloDestaque]}>{rotulo}</Text>
      <View style={styles.planoLinha}>
        <Text style={styles.planoNome}>{nome}</Text>
        <Text style={styles.planoPreco}>
          {formatarPreco(preco)}
          <Text style={styles.planoMes}> /mês</Text>
        </Text>
      </View>
      <Text style={styles.planoCreditos}>
        {creditos} {creditos === 1 ? 'crédito' : 'créditos'} por mês
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  subtitulo: { fontSize: 15, color: cores.textoSecundario, textAlign: 'center', lineHeight: 22, marginTop: 6, marginBottom: 24 },
  comparacao: { alignItems: 'stretch' },
  plano: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20, ...sombra },
  planoDestaque: { borderWidth: 2, borderColor: cores.primaria },
  planoRotulo: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: cores.textoSuave, textTransform: 'uppercase' },
  planoRotuloDestaque: { color: cores.primaria },
  planoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, gap: 8 },
  planoNome: { flexShrink: 1, fontSize: 20, fontWeight: '700', color: cores.texto },
  planoPreco: { fontSize: 17, fontWeight: '700', color: cores.primaria },
  planoMes: { fontSize: 13, fontWeight: '400', color: cores.textoSecundario },
  planoCreditos: { fontSize: 14, color: cores.textoSecundario, marginTop: 4 },
  seta: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.primariaClara,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 1,
  },
  detalhes: { backgroundColor: cores.secundariaClara, borderRadius: 28, padding: 20, gap: 16, marginTop: 20 },
  item: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextos: { flex: 1 },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  itemTexto: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20, marginTop: 2 },
  rodape: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, gap: 14 },
  botaoConfirmar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    ...sombra,
    shadowOpacity: 0.25,
  },
  desabilitado: { opacity: 0.7 },
  botaoConfirmarTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  botaoVoltar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    height: 60,
  },
  botaoVoltarTexto: { color: cores.secundaria, fontSize: 17, fontWeight: '600' },
});
