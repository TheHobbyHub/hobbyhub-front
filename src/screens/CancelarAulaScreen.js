import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AgendamentoCard from '../components/AgendamentoCard';
import { cores, sombra } from '../theme';
import { getUsuarioLogadoId, cancelarAgendamento, extrairMensagemErro } from '../services/api';

export default function CancelarAulaScreen({ navigation, route }) {
  const { agendamento } = route.params;
  const [enviando, setEnviando] = useState(false);
  const comReembolso = agendamento.alteracaoGratuita;

  const confirmar = async () => {
    setEnviando(true);
    try {
      const usuarioId = await getUsuarioLogadoId();
      await cancelarAgendamento(agendamento.id, usuarioId);
      navigation.replace('AulaCancelada', { creditoDevolvido: comReembolso });
    } catch (e) {
      Alert.alert('Não foi possível cancelar', extrairMensagemErro(e, 'Tente novamente em instantes.'));
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Tem certeza que deseja cancelar?</Text>
        <Text style={styles.subtitulo}>Confira os detalhes da aula que você está prestes a desmarcar.</Text>

        <AgendamentoCard agendamento={agendamento} />

        {comReembolso ? (
          <View style={styles.politicaOk}>
            <View style={[styles.politicaIcone, { backgroundColor: cores.primariaClara }]}>
              <Ionicons name="refresh" size={20} color={cores.primaria} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.politicaTitulo, { color: cores.primaria }]}>Crédito devolvido</Text>
              <Text style={styles.politicaTextoOk}>
                Você está cancelando com mais de 24h de antecedência, então o crédito volta para o seu saldo.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.politica}>
            <View style={styles.politicaIcone}>
              <Ionicons name="information-circle-outline" size={22} color={cores.perigoTexto} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.politicaTitulo}>Política de Cancelamento</Text>
              <Text style={styles.politicaTexto}>
                Você está cancelando com menos de 24h de antecedência. De acordo com a política do HobbyHub, os
                créditos referentes a esta aula serão debitados normalmente.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity
          style={[styles.botaoCancelar, enviando && { opacity: 0.7 }]}
          onPress={confirmar}
          disabled={enviando}
          activeOpacity={0.85}
        >
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="close" size={22} color="#FFF" />
              <Text style={styles.botaoCancelarTexto}>Confirmar Cancelamento</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoManter} onPress={() => navigation.goBack()} disabled={enviando}>
          <Ionicons name="arrow-back" size={18} color={cores.secundaria} />
          <Text style={styles.botaoManterTexto}>Manter minha aula</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  subtitulo: {
    fontSize: 15,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 6,
    marginBottom: 24,
  },
  politica: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: cores.perigoFundo,
    borderRadius: 28,
    padding: 20,
    ...sombra,
  },
  politicaOk: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: cores.superficie,
    borderRadius: 28,
    padding: 20,
    ...sombra,
  },
  politicaIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2D5D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  politicaTitulo: { fontSize: 17, fontWeight: '700', color: '#3E040A', marginBottom: 4 },
  politicaTexto: { fontSize: 15, color: cores.perigoTexto, lineHeight: 24 },
  politicaTextoOk: { fontSize: 15, color: cores.textoSecundario, lineHeight: 22 },
  rodape: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, gap: 14 },
  botaoCancelar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.perigo,
    borderRadius: 999,
    height: 60,
    ...sombra,
  },
  botaoCancelarTexto: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  botaoManter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    height: 60,
  },
  botaoManterTexto: { color: cores.secundaria, fontSize: 17, fontWeight: '600' },
});
