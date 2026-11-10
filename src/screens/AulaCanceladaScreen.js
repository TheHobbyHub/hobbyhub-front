import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, sombra } from '../theme';

export default function AulaCanceladaScreen({ navigation, route }) {
  const { creditoDevolvido } = route.params || {};

  const irPara = (aba, params) => navigation.navigate('Main', { screen: aba, params });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity style={styles.fechar} onPress={() => navigation.goBack()} accessibilityLabel="Fechar">
          <Ionicons name="close" size={24} color={cores.texto} />
        </TouchableOpacity>
      </View>

      <View style={styles.centro}>
        <View style={styles.halo}>
          <View style={styles.haloMeio}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={26} color="#FFF" />
            </View>
          </View>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillTexto}>CANCELAMENTO REALIZADO</Text>
        </View>
        <Text style={styles.titulo}>Aula cancelada com sucesso</Text>
        <Text style={styles.subtitulo}>Sua vaga foi liberada. Esperamos ver você em uma próxima oportunidade!</Text>
        <Text style={styles.credito}>
          {creditoDevolvido
            ? 'O crédito desta aula já voltou para o seu saldo.'
            : 'Como o cancelamento foi feito com menos de 24h, o crédito não foi devolvido.'}
        </Text>
      </View>

      <View style={styles.rodape}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => irPara('Agenda', { screen: 'MinhasAulas', params: { aba: 'proximas' } })}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoTexto}>Ver Minhas Aulas</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoSecundario} onPress={() => irPara('Inicio')}>
          <Text style={styles.botaoSecundarioTexto}>Voltar para o Início</Text>
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
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  halo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EEEBFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  haloMeio: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: cores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: cores.secundaria,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 14,
    borderColor: cores.secundariaClara,
  },
  pill: { backgroundColor: cores.secundariaClara, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 5 },
  pillTexto: { fontSize: 13, fontWeight: '600', letterSpacing: 0.8, color: cores.secundaria },
  titulo: { fontSize: 30, fontWeight: '700', color: cores.texto, textAlign: 'center', marginTop: 16, lineHeight: 38 },
  subtitulo: { fontSize: 15, color: cores.textoSecundario, textAlign: 'center', lineHeight: 22, marginTop: 12 },
  credito: { fontSize: 13, color: cores.textoSuave, textAlign: 'center', marginTop: 12 },
  rodape: { paddingHorizontal: 24, paddingBottom: 12, gap: 14 },
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
  botaoSecundario: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: 999,
    height: 56,
  },
  botaoSecundarioTexto: { color: cores.secundaria, fontSize: 16, fontWeight: '500' },
});
