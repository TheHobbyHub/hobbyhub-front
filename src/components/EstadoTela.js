import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={cores.primaria} />
    </View>
  );
}

export function Erro({ mensagem, onTentarNovamente }) {
  return (
    <View style={styles.centro}>
      <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
      <Text style={styles.texto}>{mensagem}</Text>
      {onTentarNovamente && (
        <TouchableOpacity style={styles.botao} onPress={onTentarNovamente}>
          <Text style={styles.botaoTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Vazio({ icone = 'calendar-clear-outline', titulo, descricao, acao, onAcao }) {
  return (
    <View style={styles.vazio}>
      <View style={styles.iconeVazio}>
        <Ionicons name={icone} size={28} color={cores.primaria} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {descricao && <Text style={styles.texto}>{descricao}</Text>}
      {acao && (
        <TouchableOpacity style={styles.botao} onPress={onAcao}>
          <Text style={styles.botaoTexto}>{acao}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  vazio: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  iconeVazio: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cores.primariaClara,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: { fontSize: 18, fontWeight: '600', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center', lineHeight: 20 },
  botao: {
    marginTop: 8,
    backgroundColor: cores.primaria,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  botaoTexto: { color: '#FFF', fontWeight: '600', fontSize: 15 },
});
