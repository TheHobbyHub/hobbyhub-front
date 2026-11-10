import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

// Cabeçalho com botão de voltar e título centralizado (Detalhes, Agendar, Reagendar)
export default function ScreenHeader({ titulo, onVoltar }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onVoltar} style={styles.voltar} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={cores.texto} />
      </TouchableOpacity>
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.voltar} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: cores.fundo,
  },
  voltar: { width: 32 },
  titulo: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: cores.texto },
});
