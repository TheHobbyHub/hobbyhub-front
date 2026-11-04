import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, sombra } from '../theme';
import { formatarDataLonga, formatarIntervalo, formatarEndereco } from '../utils/formatters';

export default function AulaAgendadaScreen({ navigation, route }) {
  const { agendamento, planoNome, saldoRestante } = route.params;

  const verMinhasAulas = () =>
    navigation.navigate('Main', { screen: 'Agenda', params: { screen: 'MinhasAulas', params: { aba: 'proximas' } } });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity style={styles.fechar} onPress={() => navigation.goBack()} accessibilityLabel="Fechar">
          <Ionicons name="close" size={24} color={cores.texto} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <View style={styles.haloMeio}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={34} color="#FFF" />
            </View>
          </View>
        </View>

        <Text style={styles.sobretitulo}>CONFIRMAÇÃO DE RESERVA</Text>
        <Text style={styles.titulo}>Aula agendada com sucesso!</Text>
        <Text style={styles.subtitulo}>
          Preparamos sua vaga com carinho. Agora é só contar os dias para colocar a mão na massa!
        </Text>

        <Text style={styles.encontro}>Temos um encontro marcado:</Text>

        <View style={styles.card}>
          <View style={styles.item}>
            <View style={[styles.itemIcone, { backgroundColor: cores.secundariaClara }]}>
              <Ionicons name="color-palette" size={24} color={cores.secundaria} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemRotulo}>Oficina Presencial</Text>
              <Text style={styles.itemTitulo}>{agendamento.titulo}</Text>
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.itemIcone}>
              <Ionicons name="calendar" size={20} color={cores.primaria} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemRotulo, { color: cores.textoSecundario }]}>Data & Horário</Text>
              <Text style={styles.itemValor}>{formatarDataLonga(agendamento.data)}</Text>
              <View style={styles.horaLinha}>
                <Ionicons name="time-outline" size={16} color={cores.secundaria} />
                <Text style={styles.hora}>{formatarIntervalo(agendamento.horaInicio, agendamento.horaFim)}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.item, { marginBottom: 0 }]}>
            <View style={styles.itemIcone}>
              <Ionicons name="location-outline" size={20} color={cores.primaria} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemValor}>{agendamento.parceiro?.nome}</Text>
              <Text style={styles.endereco}>{formatarEndereco(agendamento.parceiro?.endereco)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoLinha}>
            <Ionicons name="star" size={18} color={cores.secundaria} />
            <Text style={styles.infoTexto}>
              <Text style={styles.destaque}>
                {agendamento.creditosPagos} {agendamento.creditosPagos === 1 ? 'crédito utilizado' : 'créditos utilizados'}
              </Text>{' '}
              do seu {planoNome} • Restam{' '}
              <Text style={styles.destaque}>
                {saldoRestante} {saldoRestante === 1 ? 'crédito' : 'créditos'}
              </Text>{' '}
              este mês.
            </Text>
          </View>
          <View style={styles.infoLinha}>
            <Ionicons name="calendar-outline" size={18} color={cores.textoSecundario} />
            <Text style={styles.infoTexto}>Cancelamento ou reagendamento sem custo até 24h antes do início.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botao} onPress={verMinhasAulas} activeOpacity={0.85}>
          <Text style={styles.botaoTexto}>Ver Minhas Aulas</Text>
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
  titulo: { textAlign: 'center', fontSize: 30, fontWeight: '700', color: cores.secundaria, marginTop: 6, lineHeight: 38 },
  subtitulo: { textAlign: 'center', fontSize: 15, color: cores.textoSecundario, lineHeight: 22, marginTop: 10 },
  encontro: { fontSize: 20, fontWeight: '600', color: cores.secundaria, marginTop: 28, marginBottom: 12 },
  card: { backgroundColor: cores.superficie, borderRadius: 32, padding: 24, ...sombra },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: cores.superficieBaixa,
    padding: 16,
    marginBottom: 20,
  },
  itemIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.superficieMedia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRotulo: { fontSize: 13, color: cores.secundaria },
  itemTitulo: { fontSize: 19, fontWeight: '500', color: cores.texto },
  itemValor: { fontSize: 16, fontWeight: '600', color: cores.texto },
  horaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  hora: { fontSize: 16, fontWeight: '600', color: cores.secundaria },
  endereco: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  info: { backgroundColor: cores.superficieMedia, padding: 18, marginTop: 20, gap: 14 },
  infoLinha: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoTexto: { flex: 1, fontSize: 13, color: cores.textoSecundario, lineHeight: 19 },
  destaque: { color: cores.secundaria },
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
  botaoTexto: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
