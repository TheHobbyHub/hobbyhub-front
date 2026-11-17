import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

// O usuário ainda não tem foto cadastrada: mostra um fundo lilás com o ícone de pessoa (mesma ideia do AulaImagem)
export default function AvatarUsuario({ tamanho = 96, verificado = false }) {
  const selo = Math.round(tamanho * 0.28);

  return (
    <View style={[styles.moldura, { width: tamanho + 8, height: tamanho + 8, borderRadius: (tamanho + 8) / 2 }]}>
      <View style={[styles.avatar, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}>
        <Ionicons name="person" size={tamanho * 0.5} color={cores.secundaria} />
      </View>
      {verificado && (
        <View style={[styles.selo, { width: selo, height: selo, borderRadius: selo / 2 }]}>
          <Ionicons name="checkmark" size={selo * 0.6} color="#FFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: { backgroundColor: cores.superficie, justifyContent: 'center', alignItems: 'center' },
  avatar: { backgroundColor: cores.secundariaClara, justifyContent: 'center', alignItems: 'center' },
  selo: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    backgroundColor: cores.primaria,
    borderWidth: 2,
    borderColor: cores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
