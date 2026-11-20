import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, sombra } from '../theme';
import { formatarPreco, formatarDiaMes, removerPrefixoPlano } from '../utils/formatters';

export default function TrocaPlanoConcluidaScreen({ navigation, route }) {
  const { opcao, atualNome, dataRenovacao } = route.params;
  const upgrade = opcao.tipo === 'UPGRADE';
  const nome = removerPrefixoPlano(opcao.nome);
  const renovacao = formatarDiaMes(dataRenovacao);

  // Volta direto para Gerenciar Assinatura (que recarrega ao ganhar foco), tirando Alterar Plano da pilha
  const voltar = () =>
    navigation.popTo('Main', { screen: 'Perfil', params: { screen: 'GerenciarAssinatura', pop: true } });

  // O "voltar" do Android também vai para Gerenciar Assinatura, e não para Alterar Plano com dados antigos
  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      voltar();
      return true;
    });
    return () => assinatura.remove();
  }, []);

  const itens = upgrade
    ? [
        { icone: 'ribbon-outline', rotulo: 'Plano atual', valor: `${nome} • ativo agora` },
        { icone: 'add-circle-outline', rotulo: 'Créditos adicionados', valor: `+${opcao.creditosAdicionais} no seu saldo` },
        { icone: 'cash-outline', rotulo: 'Cobrado hoje', valor: formatarPreco(opcao.valorCobradoHoje) },
        { icone: 'calendar-outline', rotulo: 'Próxima renovação', valor: `${renovacao} • ${formatarPreco(opcao.precoMensal)}` },
      ]
    : [
        { icone: 'ribbon-outline', rotulo: 'Até a renovação', valor: `${removerPrefixoPlano(atualNome)} (sem mudanças)` },
        { icone: 'calendar-outline', rotulo: 'Novo plano a partir de', valor: `${renovacao} • ${nome}` },
        { icone: 'cash-outline', rotulo: 'Nova mensalidade', valor: formatarPreco(opcao.precoMensal) },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity style={styles.fechar} onPress={voltar} accessibilityLabel="Fechar">
          <Ionicons name="close" size={24} color={cores.texto} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <View style={styles.haloMeio}>
            <View style={styles.check}>
              <Ionicons name={upgrade ? 'arrow-up' : 'checkmark'} size={34} color="#FFF" />
            </View>
          </View>
        </View>

        <Text style={styles.sobretitulo}>{upgrade ? 'UPGRADE CONFIRMADO' : 'TROCA AGENDADA'}</Text>
        <Text style={styles.titulo}>{upgrade ? `Bem-vindo ao ${nome}!` : 'Troca de plano agendada!'}</Text>
        <Text style={styles.subtitulo}>
          {upgrade
            ? 'Seus novos créditos já estão disponíveis. Aproveite para agendar mais oficinas!'
            : `Você continua aproveitando seu plano atual até ${renovacao}. Se mudar de ideia, é só desistir da troca em Gerenciar Assinatura.`}
        </Text>

        <View style={styles.card}>
          {itens.map((item, indice) => (
            <View key={item.rotulo} style={[styles.item, indice === itens.length - 1 && styles.itemUltimo]}>
              <View style={styles.itemIcone}>
                <Ionicons name={item.icone} size={20} color={cores.primaria} />
              </View>
              <View style={styles.itemTextos}>
                <Text style={styles.itemRotulo}>{item.rotulo}</Text>
                <Text style={styles.itemValor}>{item.valor}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botao} onPress={voltar} activeOpacity={0.85}>
          <Text style={styles.botaoTexto}>Voltar para minha assinatura</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  topo: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  fechar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.superficieMedia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  halo: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -50,
  },
  haloMeio: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: cores.primariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#5C67A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sobretitulo: { textAlign: 'center', fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: cores.primaria },
  titulo: { textAlign: 'center', fontSize: 28, fontWeight: '700', color: cores.secundaria, marginTop: 6, lineHeight: 36 },
  subtitulo: { textAlign: 'center', fontSize: 15, color: cores.textoSecundario, lineHeight: 22, marginTop: 10, marginBottom: 24 },
  card: { backgroundColor: cores.superficie, borderRadius: 32, padding: 20, ...sombra },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.superficieMedia,
  },
  itemUltimo: { paddingBottom: 0, marginBottom: 0, borderBottomWidth: 0 },
  itemIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.primariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextos: { flex: 1 },
  itemRotulo: { fontSize: 13, color: cores.textoSecundario },
  itemValor: { fontSize: 16, fontWeight: '600', color: cores.texto, marginTop: 2 },
  rodape: { paddingHorizontal: 24, paddingVertical: 12 },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    ...sombra,
  },
  botaoTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
