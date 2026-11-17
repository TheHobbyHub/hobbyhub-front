import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, sombra } from '../theme';

// Card branco com ícone e título que agrupa campos de formulário (Dados da Conta, Alterar Senha)
export default function SecaoFormulario({ icone, titulo, children }) {
  return (
    <View style={styles.secao}>
      <View style={styles.topo}>
        <View style={styles.icone}>
          <Ionicons name={icone} size={18} color={cores.secundaria} />
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { backgroundColor: cores.superficie, borderRadius: 32, padding: 24, paddingTop: 20, marginTop: 20, ...sombra },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: { fontSize: 20, fontWeight: '600', color: cores.texto },
});
