import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AulaImagem from './AulaImagem';
import { cores, sombra } from '../theme';
import { formatarDuracaoCurta } from '../utils/formatters';

// Card de aula usado na Home ("Ateliês em destaque") e no Explorar
export default function AulaCard({ aula, onPress }) {
  const incluso = aula.inclusoNoPlano === true;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View>
        <AulaImagem uri={aula.imagemUrl} categoria={aula.categoria} style={styles.imagem} />
        {(incluso || aula.planoMinimo) && (
          <View style={styles.badge}>
            <Ionicons
              name={incluso ? 'checkmark-circle' : 'ribbon-outline'}
              size={14}
              color={cores.primaria}
            />
            <Text style={styles.badgeTexto}>{incluso ? 'Incluso no plano' : aula.planoMinimo}</Text>
          </View>
        )}
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.parceiro}>{aula.parceiroNome?.toUpperCase()}</Text>
        <Text style={styles.titulo}>{aula.titulo}</Text>
        <View style={styles.infoLinha}>
          <View style={styles.info}>
            <Ionicons name="location-outline" size={15} color={cores.primaria} />
            <Text style={styles.infoTexto}>{aula.bairro}, {aula.estado}</Text>
          </View>
          <View style={styles.info}>
            <Ionicons name="time-outline" size={15} color={cores.primaria} />
            <Text style={styles.infoTexto}>{formatarDuracaoCurta(aula.duracaoMinutos)} por sessão</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    ...sombra,
  },
  imagem: { height: 170 },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeTexto: { fontSize: 13, color: cores.texto, fontWeight: '500' },
  conteudo: { padding: 20 },
  parceiro: { fontSize: 12, fontWeight: '700', color: cores.primaria, letterSpacing: 0.6, marginBottom: 6 },
  titulo: { fontSize: 19, fontWeight: '600', color: cores.texto, lineHeight: 26, marginBottom: 10 },
  infoLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoTexto: { fontSize: 13, color: cores.textoSecundario },
});
