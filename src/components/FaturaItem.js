import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';
import { formatarDataExtenso, formatarPreco } from '../utils/formatters';

const DESCRICAO_TIPO = { MENSALIDADE: 'Fatura mensal', UPGRADE: 'Upgrade de plano' };

// Linha do histórico de faturamento (Gerenciar Assinatura e Histórico de Faturamento)
export default function FaturaItem({ fatura }) {
  return (
    <View style={styles.item}>
      <View style={styles.icone}>
        <Ionicons name="checkmark-circle-outline" size={22} color={cores.secundaria} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.data}>{formatarDataExtenso(fatura.data)}</Text>
        <Text style={styles.descricao}>
          {DESCRICAO_TIPO[fatura.tipo] || 'Fatura'} • {fatura.planoNome}
        </Text>
      </View>
      <View style={styles.valores}>
        <Text style={styles.valor}>{formatarPreco(fatura.valor)}</Text>
        <Text style={styles.status}>{fatura.status === 'PAGO' ? 'Pago' : fatura.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textos: { flex: 1 },
  data: { fontSize: 16, fontWeight: '600', color: cores.texto },
  descricao: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  valores: { alignItems: 'flex-end' },
  valor: { fontSize: 16, fontWeight: '600', color: cores.texto },
  status: { fontSize: 12, fontWeight: '600', color: cores.secundaria, marginTop: 4 },
});
