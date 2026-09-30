import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function PlanosScreen({ navigation }) {
  const [planos, setPlanos] = useState([]);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const detalhesVisuais = {
    'Plano Essencial': { 
      badge: 'Iniciante', 
      icon: 'color-palette-outline', 
      desc: 'Ideal para experimentar e criar sem rotina fixa',
      textoRodape: (preco, aulas) => `R$ ${(preco / aulas).toFixed(2).replace('.', ',')} por encontro`
    },
    'Plano Plus': { 
      badge: 'Recomendado', 
      icon: 'star', 
      desc: '1 aula por semana • Acesso aos ateliês premium da cidade',
      textoRodape: (preco, aulas) => `R$ ${(preco / aulas).toFixed(2).replace('.', ',')} por encontro (Melhor valor)`
    },
    'Plano Premium': { 
      badge: 'VIP', 
      icon: 'diamond-outline', 
      desc: 'Imersão completa com horários nobres e oficinas mestres',
      textoRodape: () => 'Prioridade em turmas de fim de semana'
    }
  };

  useEffect(() => {
    async function fetchPlanos() {
      try {
        const response = await api.get('/assinaturas/planos');
        setPlanos(response.data);
        const recomendado = response.data.find(p => p.recomendado);
        if (recomendado) setPlanoSelecionado(recomendado.id);
        else if (response.data.length > 0) setPlanoSelecionado(response.data[0].id);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os planos de assinatura.');
      } finally {
        setLoading(false);
      }
    }
    fetchPlanos();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A5799" />
      </View>
    );
  }

  const planoAtual = planos.find(p => p.id === planoSelecionado);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planos De Assinatura</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Escolha seu plano ideal</Text>
        <Text style={styles.subtitulo}>
          Tenha créditos mensais flexíveis para fazer aulas presenciais nos melhores ateliês e estúdios parceiros.
        </Text>

        <View style={styles.cardsContainer}>
          {planos.map((plano) => {
            const isSelected = planoSelecionado === plano.id;
            const visual = detalhesVisuais[plano.nome] || detalhesVisuais['Plano Essencial'];
            const [reais, centavos] = plano.precoMensal.toFixed(2).split('.');

            return (
              <View key={plano.id}>
                {plano.recomendado && (
                  <View style={styles.maisEscolhidoBadge}>
                    <Ionicons name="star" size={12} color="#FFF" />
                    <Text style={styles.maisEscolhidoText}>MAIS ESCOLHIDO</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={[styles.card, isSelected ? styles.cardSelecionado : styles.cardNormal]}
                  onPress={() => setPlanoSelecionado(plano.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardContentTop}>
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.planoNome, isSelected && styles.textoEscuro]}>
                          {plano.nome.replace('Plano ', '')}
                        </Text>
                        <View style={[styles.badgeContainer, isSelected ? styles.badgeSelected : styles.badgeNormal]}>
                          <Text style={[styles.badgeText, isSelected ? styles.badgeTextSelected : styles.badgeTextNormal]}>
                            {visual.badge}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.porApenas}>por apenas</Text>
                        <Text style={styles.preco}>R$ {reais}<Text style={styles.centavos}>,{centavos}</Text></Text>
                        <Text style={styles.mensal}>mensal</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.descricao}>{visual.desc}</Text>
                    
                    <View style={styles.aulasRow}>
                      <Ionicons name={visual.icon} size={18} color="#4A5799" />
                      <Text style={styles.aulasText}>{plano.creditosMensais} aulas presenciais <Text style={{fontWeight: 'normal', fontSize: 12}}>/mês</Text></Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cardRodape, isSelected ? styles.rodapeSelected : styles.rodapeNormal]}>
                    <Text style={styles.rodapeText}>{visual.textoRodape(plano.precoMensal, plano.creditosMensais)}</Text>
                    <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color="#4A5799" style={{ margin: -4 }} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.garantiasContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#1A1A1A" />
            <Text style={styles.garantiasTitulo}>Garantias de toda assinatura</Text>
          </View>
          <View style={styles.garantiaRow}>
            <View style={styles.checkBg}><Ionicons name="checkmark" size={12} color="#4A5799" /></View>
            <Text style={styles.garantiaText}>Cancele ou pause sua assinatura a qualquer momento</Text>
          </View>
          <View style={styles.garantiaRow}>
            <View style={styles.checkBg}><Ionicons name="checkmark" size={12} color="#4A5799" /></View>
            <Text style={styles.garantiaText}>Sem taxa de matrícula ou multas de permanência</Text>
          </View>
          <View style={styles.garantiaRow}>
            <View style={styles.checkBg}><Ionicons name="checkmark" size={12} color="#4A5799" /></View>
            <Text style={styles.garantiaText}>Não usou tudo? Créditos acumulam por 30 dias adicionais</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.btnContinuar} 
          onPress={() => navigation.navigate('Checkout', { plano: planoAtual })}
        >
          <Text style={styles.btnContinuarTexto}>Continuar com {planoAtual?.nome.replace('Plano ', '')} <Ionicons name="arrow-forward" size={16} color="#FFF" /></Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnPular} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.btnPularTexto}>Agora não, quero explorar o catálogo primeiro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, color: '#1A1A1A', fontWeight: '500' },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 22 },
  cardsContainer: { gap: 16, marginBottom: 24 },
  card: { borderRadius: 24, overflow: 'hidden' },
  cardNormal: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F0F5' },
  cardSelecionado: { backgroundColor: '#EBE5FF', borderColor: '#EBE5FF', borderWidth: 1 },
  maisEscolhidoBadge: { position: 'absolute', top: -10, right: 20, zIndex: 10, backgroundColor: '#4A5799', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  maisEscolhidoText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  cardContentTop: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  planoNome: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  textoEscuro: { color: '#1A1A1A' },
  badgeContainer: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeNormal: { backgroundColor: '#F0F0F5' },
  badgeSelected: { backgroundColor: '#4A5799' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextNormal: { color: '#666' },
  badgeTextSelected: { color: '#FFF' },
  porApenas: { fontSize: 10, color: '#666', marginBottom: -2 },
  preco: { fontSize: 26, fontWeight: 'bold', color: '#4A5799' },
  centavos: { fontSize: 14 },
  mensal: { fontSize: 10, color: '#666', marginTop: -2 },
  descricao: { fontSize: 12, color: '#666', marginBottom: 12, paddingRight: 40, lineHeight: 18 },
  aulasRow: { flexDirection: 'row', alignItems: 'center' },
  aulasText: { fontSize: 14, fontWeight: 'bold', color: '#4A5799', marginLeft: 6 },
  cardRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  rodapeNormal: { backgroundColor: '#F4F5F9' },
  rodapeSelected: { backgroundColor: '#F8F9FE' },
  rodapeText: { fontSize: 12, color: '#666' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#A9A9A9' },
  radioSelected: { borderColor: 'transparent' },
  garantiasContainer: { backgroundColor: '#F5F5FA', padding: 20, borderRadius: 20, marginBottom: 24 },
  garantiasTitulo: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 8 },
  garantiaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  checkBg: { backgroundColor: '#EBE5FF', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  garantiaText: { fontSize: 13, color: '#444', marginLeft: 8, flex: 1, lineHeight: 18 },
  btnContinuar: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#4A5799', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  btnContinuarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  btnPular: { alignItems: 'center', paddingVertical: 8 },
  btnPularTexto: { color: '#7986CB', fontSize: 14, fontWeight: '600' }
});