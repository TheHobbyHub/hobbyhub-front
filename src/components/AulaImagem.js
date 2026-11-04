import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Enquanto as aulas não têm foto cadastrada, mostra um fundo com o ícone da categoria
const ESTILOS_CATEGORIA = [
  { termo: 'cer', icone: 'flower-outline', fundo: '#EDE3D9', cor: '#9A6B4F' },
  { termo: 'pint', icone: 'brush', fundo: '#E3E8FA', cor: '#4A5799' },
  { termo: 'marc', icone: 'hammer', fundo: '#EFE6D6', cor: '#8A6A3B' },
  { termo: 'gastr', icone: 'chef-hat', fundo: '#F6E6DA', cor: '#A8603F' },
  { termo: 'cost', icone: 'needle', fundo: '#EAE2FF', cor: '#5F53A1' },
];

const normalizar = (texto) =>
  (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const estiloCategoria = (categoria) =>
  ESTILOS_CATEGORIA.find((e) => normalizar(categoria).includes(e.termo)) || {
    icone: 'palette-outline',
    fundo: '#E5DEFF',
    cor: '#5F53A1',
  };

export default function AulaImagem({ uri, categoria, style, iconSize = 56 }) {
  if (uri) {
    return <Image source={{ uri }} style={[styles.base, style]} resizeMode="cover" />;
  }

  const estilo = estiloCategoria(categoria);
  return (
    <View style={[styles.base, styles.placeholder, { backgroundColor: estilo.fundo }, style]}>
      <MaterialCommunityIcons name={estilo.icone} size={iconSize} color={estilo.cor} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { width: '100%', overflow: 'hidden' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
});
