import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { cores, sombra } from '../theme';
import { formatarDiaMes } from '../utils/formatters';

// Regras da assinatura. Precisam bater com o backend (AssinaturaService e AgendamentoService)
const REGRAS = [
  {
    icone: 'sync-outline',
    titulo: 'Ciclo mensal',
    texto: 'Sua assinatura renova automaticamente a cada mês, na mesma data em que você assinou. A cobrança é feita no cartão cadastrado.',
  },
  {
    icone: 'color-palette-outline',
    titulo: 'Créditos de oficinas',
    texto: 'A cada renovação seu saldo volta para o número de créditos do seu plano. Créditos não usados não acumulam para o mês seguinte.',
  },
  {
    icone: 'calendar-outline',
    titulo: 'Agendamentos',
    texto: 'Cada aula agendada usa créditos do seu saldo. Cancelando com mais de 24h de antecedência, o crédito volta para você; com menos de 24h, ele é debitado normalmente.',
  },
  {
    icone: 'trending-up-outline',
    titulo: 'Upgrade de plano',
    texto: 'O novo plano vale na hora. Você paga só a diferença de preço proporcional aos dias que faltam no ciclo e ganha na hora a diferença de créditos. A data de renovação não muda.',
  },
  {
    icone: 'trending-down-outline',
    titulo: 'Downgrade de plano',
    texto: 'O plano mais barato começa na próxima renovação. Até lá, você continua com o plano atual e pode desistir da troca a qualquer momento.',
  },
  {
    icone: 'close-circle-outline',
    titulo: 'Cancelamento da assinatura',
    texto: 'Sem multa. Ao cancelar, a assinatura não renova, mas você mantém seus créditos e aulas agendadas até o fim do ciclo atual. Você pode reativá-la até essa data.',
  },
];

export default function PreferenciasPlanoScreen({ navigation, route }) {
  const dataRenovacao = route.params?.dataRenovacao;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Preferências do Plano" onVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Regras de cancelamento e créditos</Text>
        <Text style={styles.introducao}>Entenda como funcionam o ciclo mensal, a troca de plano e os agendamentos.</Text>

        {dataRenovacao && (
          <View style={styles.destaque}>
            <Ionicons name="time-outline" size={22} color="#FFF" />
            <Text style={styles.destaqueTexto}>
              Seu ciclo atual vai até <Text style={styles.destaqueData}>{formatarDiaMes(dataRenovacao)}</Text>.
            </Text>
          </View>
        )}

        {REGRAS.map((regra) => (
          <View key={regra.titulo} style={styles.card}>
            <View style={styles.icone}>
              <Ionicons name={regra.icone} size={22} color={cores.secundaria} />
            </View>
            <View style={styles.textos}>
              <Text style={styles.cardTitulo}>{regra.titulo}</Text>
              <Text style={styles.cardTexto}>{regra.texto}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto },
  introducao: { fontSize: 15, color: cores.textoSecundario, marginTop: 6, lineHeight: 22 },
  destaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.primaria,
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
  },
  destaqueTexto: { flex: 1, fontSize: 15, color: '#FFF' },
  destaqueData: { fontWeight: '700' },
  card: { flexDirection: 'row', gap: 14, backgroundColor: cores.superficie, borderRadius: 24, padding: 20, marginTop: 14, ...sombra },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textos: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  cardTexto: { fontSize: 14, color: cores.textoSecundario, marginTop: 4, lineHeight: 20 },
});
