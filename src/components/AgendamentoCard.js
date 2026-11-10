import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AulaImagem from './AulaImagem';
import { cores, sombra } from '../theme';
import { formatarDataCurta, formatarIntervalo, formatarEndereco } from '../utils/formatters';

// Card de um agendamento (Minhas Aulas e confirmação de cancelamento). As ações entram como children.
export default function AgendamentoCard({ agendamento, children }) {
  return (
    <View style={styles.card}>
      <AulaImagem uri={agendamento.imagemUrl} categoria={agendamento.categoria} style={styles.imagem} />

      <Text style={styles.titulo}>{agendamento.titulo}</Text>
      <View style={styles.instrutor}>
        <Ionicons name="person-outline" size={15} color={cores.primaria} />
        <Text style={styles.instrutorTexto}>Com {agendamento.instrutorNome}</Text>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.linhaTopo}>
          <View style={styles.linha}>
            <Ionicons name="calendar-outline" size={17} color={cores.primaria} />
            <Text style={styles.data}>{formatarDataCurta(agendamento.data)}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="time-outline" size={17} color={cores.primaria} />
            <Text style={styles.hora}>{formatarIntervalo(agendamento.horaInicio, agendamento.horaFim)}</Text>
          </View>
        </View>
        <View style={[styles.linha, { alignItems: 'flex-start' }]}>
          <Ionicons name="location-outline" size={17} color={cores.primaria} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.parceiro}>{agendamento.parceiro?.nome}</Text>
            <Text style={styles.endereco}>{formatarEndereco(agendamento.parceiro?.endereco)}</Text>
          </View>
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
    ...sombra,
  },
  imagem: { height: 170, borderRadius: 20 },
  titulo: { fontSize: 20, fontWeight: '600', color: cores.texto, marginTop: 14 },
  instrutor: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  instrutorTexto: { fontSize: 14, color: cores.textoSecundario },
  infoBox: { backgroundColor: cores.superficieBaixa, padding: 14, marginTop: 14, gap: 12 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  data: { fontSize: 13, color: cores.textoSecundario },
  hora: { fontSize: 15, fontWeight: '600', color: cores.texto },
  parceiro: { fontSize: 15, fontWeight: '600', color: cores.texto },
  endereco: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
});
