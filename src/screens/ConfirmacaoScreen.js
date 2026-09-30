import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmacaoScreen({ route, navigation }) {
  const { plano } = route.params;

  const precoFormatado = plano.precoMensal.toFixed(2).replace('.', ',');

  // Calcula a data de renovação para 1 mês a partir de hoje
  const dataAtual = new Date();
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dataRenovacao = `${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topArea}>
          <View style={styles.iconeContainerWrapper}>
            <View style={styles.iconeContainer}>
              <Ionicons name="checkmark" size={40} color="#4A5799" />
            </View>
            <View style={styles.miniIcon1}><Ionicons name="color-palette" size={12} color="#FFF" /></View>
            <View style={styles.miniIcon2}><Ionicons name="megaphone" size={12} color="#4A5799" /></View>
          </View>
          <Text style={styles.titulo}>Assinatura confirmada{'\n'}com sucesso!</Text>
          <Text style={styles.subtitulo}>
            Seja bem-vindo(a) ao <Text style={{color: '#4A5799', fontWeight: 'bold'}}>HobbyHub</Text>! Seu {plano.nome} já está ativo e pronto para uso.
          </Text>
        </View>

        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4A5799" />
          <Text style={styles.cardTitulo}>{plano.nome} Ativo</Text>
          <View style={{flex: 1}}/>
          <View style={styles.precoBadge}>
            <Text style={styles.precoBadgeText}>R$ {precoFormatado}/mês</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.listItem}>
            <View style={styles.listIconBox}><Ionicons name="ticket-outline" size={20} color="#4A5799" /></View>
            <View style={styles.listTextContainer}>
              <Text style={styles.itemTitulo}>{plano.creditosMensais} aulas liberadas</Text>
              <Text style={styles.itemSubtitulo}>Créditos mensais flexíveis já adicionados à sua conta</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <View style={styles.listIconBox}><Ionicons name="calendar-outline" size={20} color="#4A5799" /></View>
            <View style={styles.listTextContainer}>
              <Text style={styles.itemTitulo}>Próxima renovação</Text>
              <Text style={styles.itemSubtitulo}>{dataRenovacao} (renovação automática)</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <View style={styles.listIconBox}><Ionicons name="storefront-outline" size={20} color="#4A5799" /></View>
            <View style={styles.listTextContainer}>
              <Text style={styles.itemTitulo}>+150 ateliês parceiros</Text>
              <Text style={styles.itemSubtitulo}>Acesso a oficinas de cerâmica, pintura, marcenaria e mais</Text>
            </View>
          </View>
        </View>

        <View style={styles.sugestoesHeader}>
          <Text style={styles.sugestoesTitulo}>Sugestões para começar</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.explorarText}>Explorar todas </Text>
            <Ionicons name="arrow-forward" size={14} color="#4A5799" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
          <View style={styles.sugestaoCard}>
            <View style={styles.sugestaoImgBox}>
              <View style={styles.sugestaoImgPlaceholder} />
              <View style={styles.sugestaoBadge}><Text style={styles.sugestaoBadgeText}>Cerâmica</Text></View>
            </View>
            <Text style={styles.sugestaoTitle}>Torno e Modelagem</Text>
            <Text style={styles.sugestaoSubtitle}>Ateliê Luz • Pinheiros</Text>
          </View>
          <View style={styles.sugestaoCard}>
            <View style={styles.sugestaoImgBox}>
              <View style={[styles.sugestaoImgPlaceholder, {backgroundColor: '#EAE2FF'}]} />
              <View style={styles.sugestaoBadge}><Text style={styles.sugestaoBadgeText}>Pintura</Text></View>
            </View>
            <Text style={styles.sugestaoTitle}>Aquarela Botânica</Text>
            <Text style={styles.sugestaoSubtitle}>Espaço Criar • Vila Madalena</Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.btnPersonalizar} onPress={() => navigation.navigate('Welcome')}>
          <Ionicons name="options-outline" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.btnPersonalizarTexto}>Personalizar meus hobbies</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnDireto} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.btnDiretoText}>Ir direto para a tela inicial</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, color: '#4A5799', fontWeight: '600' },
  scroll: { paddingBottom: 40 },
  topArea: { alignItems: 'center', paddingHorizontal: 24, marginTop: 20, marginBottom: 30 },
  iconeContainerWrapper: { position: 'relative', marginBottom: 20 },
  iconeContainer: { width: 80, height: 80, backgroundColor: '#EAE2FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },
  miniIcon1: { position: 'absolute', bottom: -5, left: -5, backgroundColor: '#FFB2A8', padding: 4, borderRadius: 12 },
  miniIcon2: { position: 'absolute', top: -5, right: -5, backgroundColor: '#E0E7FF', padding: 4, borderRadius: 12 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#4A5799', textAlign: 'center', marginBottom: 12, lineHeight: 32 },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
  cardTitulo: { fontSize: 14, fontWeight: 'bold', color: '#4A5799', marginLeft: 8 },
  precoBadge: { backgroundColor: '#5C6BC0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  precoBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginHorizontal: 24, marginBottom: 30, borderWidth: 1, borderColor: '#F0F0F5' },
  listItem: { flexDirection: 'row', marginBottom: 20 },
  listIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2EDFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  listTextContainer: { flex: 1, justifyContent: 'center' },
  itemTitulo: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  itemSubtitulo: { fontSize: 12, color: '#666', lineHeight: 16 },
  sugestoesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sugestoesTitulo: { fontSize: 16, fontWeight: 'bold', color: '#4A5799' },
  explorarText: { fontSize: 12, color: '#4A5799', fontWeight: '500' },
  carouselContainer: { paddingHorizontal: 24, gap: 16, marginBottom: 30 },
  sugestaoCard: { width: 160, backgroundColor: '#FFF', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#F0F0F5' },
  sugestaoImgBox: { width: '100%', height: 90, borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative' },
  sugestaoImgPlaceholder: { flex: 1, backgroundColor: '#D4C4FF' },
  sugestaoBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sugestaoBadgeText: { fontSize: 10, color: '#4A5799', fontWeight: 'bold' },
  sugestaoTitle: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  sugestaoSubtitle: { fontSize: 10, color: '#666' },
  btnPersonalizar: { flexDirection: 'row', backgroundColor: '#4A5799', paddingVertical: 18, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginBottom: 16 },
  btnPersonalizarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnDireto: { alignItems: 'center', marginBottom: 20 },
  btnDiretoText: { color: '#7986CB', fontSize: 14, fontWeight: '600' }
});