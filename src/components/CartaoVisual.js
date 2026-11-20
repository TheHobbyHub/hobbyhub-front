import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Pré-visualização do cartão enquanto a pessoa digita (Checkout e Trocar Cartão)
export default function CartaoVisual({ numero, nomeTitular, validade }) {
  return (
    <View style={styles.cartao}>
      <View style={styles.topo}>
        <View style={styles.rotulo}>
          <Ionicons name="radio-outline" size={18} color="#FFF" />
          <Text style={styles.rotuloTexto}>CARTÃO DE CRÉDITO</Text>
        </View>
        <View style={styles.circulos}>
          <View style={[styles.circulo, styles.circuloFundo]} />
          <View style={[styles.circulo, styles.circuloFrente]} />
        </View>
      </View>
      <Text style={styles.numero}>{numero || '•••• •••• •••• ••••'}</Text>
      <View style={styles.rodape}>
        <View style={styles.titular}>
          <Text style={styles.dica}>TITULAR</Text>
          <Text style={styles.texto} numberOfLines={1}>
            {nomeTitular ? nomeTitular.toUpperCase() : 'NOME DO TITULAR'}
          </Text>
        </View>
        <View style={styles.validade}>
          <Text style={styles.dica}>VALIDADE</Text>
          <Text style={styles.texto}>{validade || 'MM/AA'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: '#5C6BC0', borderRadius: 24, padding: 24, height: 190, justifyContent: 'space-between', marginBottom: 24 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rotulo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rotuloTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  circulos: { flexDirection: 'row' },
  circulo: { width: 24, height: 24, borderRadius: 12 },
  circuloFundo: { backgroundColor: 'rgba(255,255,255,0.5)', marginRight: -8 },
  circuloFrente: { backgroundColor: 'rgba(255,255,255,0.8)' },
  numero: { fontSize: 22, color: '#FFFFFF', letterSpacing: 2, textAlign: 'center' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 },
  titular: { flex: 1 },
  validade: { alignItems: 'flex-end' },
  dica: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', marginBottom: 2, letterSpacing: 1 },
  texto: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
