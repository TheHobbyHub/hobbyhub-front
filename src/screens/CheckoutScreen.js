import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function CheckoutScreen({ route, navigation }) {
  const { plano } = route.params; 

  const [loading, setLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');

  // Busca o ID do usuário logado assim que a tela abre
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const idSalvo = await AsyncStorage.getItem('@usuario_logado_id');
        if (idSalvo) {
          setUsuarioId(Number(idSalvo));
        } else {
          Alert.alert('Erro', 'Usuário não logado. Faça o login novamente.');
        }
      } catch (error) {
        console.error('Erro ao buscar usuário logado', error);
      }
    }
    carregarUsuario();
  }, []);

  const handleValidadeChange = (text) => {
    let formatado = text.replace(/\D/g, ''); 
    if (formatado.length > 2) {
      formatado = formatado.substring(0, 2) + '/' + formatado.substring(2, 4);
    }
    setValidade(formatado);
  };

  const handleConfirmarAssinatura = async () => {
    if (!numeroCartao || !nomeCartao || !validade || !cvv) {
      Alert.alert('Atenção', 'Por favor, preencha todos os dados do cartão para prosseguir.');
      return;
    }

    if (!usuarioId) {
      Alert.alert('Erro', 'Sessão inválida. Por favor, retorne e faça login.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/assinaturas/assinar', {
        usuarioId: usuarioId,
        planoId: plano.id,
        metodoPagamento: 'cartao_credito'
      });
      
      navigation.navigate('Confirmacao', { plano: plano });
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao processar assinatura.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  // Função para retornar a tag correta baseada no nome do plano
  const getBadge = (nome) => {
    if (nome.includes('Essencial')) return 'Iniciante';
    if (nome.includes('Plus')) return 'Recomendado';
    if (nome.includes('Premium')) return 'VIP';
    return plano.recomendado ? 'Recomendado' : 'Opção';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Checkout</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <View style={styles.seguroBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#4A5799" />
              <Text style={styles.seguroText}>Checkout Seguro de Assinatura</Text>
            </View>
            <Text style={styles.titulo}>Finalizar Inscrição</Text>
            <Text style={styles.subtitulo}>Revise seu plano e confirme sua nova jornada criativa no HobbyHub.</Text>
          </View>

          <View style={styles.resumoCard}>
            <View style={styles.resumoInfo}>
              <View style={styles.badgeContainer}>
                {/* Aqui a tag condizente é exibida dinamicamente */}
                <Text style={styles.badgeTexto}>{getBadge(plano.nome)}</Text>
              </View>
              <Text style={styles.planoNome}>{plano.nome.replace('Plano ', '')}</Text>
              <Text style={styles.preco}>R$ {plano.precoMensal.toFixed(2).replace('.', ',')}<Text style={{fontWeight: 'normal', fontSize: 12}}>/mês</Text></Text>
            </View>
            <View style={styles.aulasArea}>
              <Text style={styles.aulasNumero}>{plano.creditosMensais}</Text>
              <Text style={styles.aulasTexto}>aulas por mês</Text>
            </View>
          </View>

          <View style={styles.metodoHeader}>
            <Ionicons name="card-outline" size={20} color="#4A5799" />
            <Text style={styles.cartaoTitulo}>Cartão de Crédito</Text>
          </View>

          <View style={styles.cartaoMock}>
            <View style={styles.cartaoMockTop}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="radio-outline" size={18} color="#FFF" style={{marginRight: 6}} />
                <Text style={styles.cartaoMockLabel}>CARTÃO DE CRÉDITO</Text>
              </View>
              <View style={styles.cartaoMockCircles}>
                <View style={[styles.circle, {backgroundColor: 'rgba(255,255,255,0.5)', marginRight: -8}]} />
                <View style={[styles.circle, {backgroundColor: 'rgba(255,255,255,0.8)'}]} />
              </View>
            </View>
            <Text style={styles.cartaoNumero}>
              {numeroCartao ? numeroCartao.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cartaoRodape}>
              <View>
                <Text style={styles.cartaoHint}>TITULAR</Text>
                <Text style={styles.cartaoTexto}>{nomeCartao ? nomeCartao.toUpperCase() : 'NOME DO TITULAR'}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.cartaoHint}>VALIDADE</Text>
                <Text style={styles.cartaoTexto}>{validade || 'MM/AA'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formArea}>
            <Text style={styles.inputLabel}>Número do Cartão</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={18} color="#4A5799" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={16}
                value={numeroCartao}
                onChangeText={setNumeroCartao}
              />
            </View>

            <Text style={styles.inputLabel}>Nome Impresso</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#4A5799" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Como está no cartão"
                value={nomeCartao}
                onChangeText={setNomeCartao}
                autoCapitalize="characters"
              />
            </View>

            <View style={{flexDirection: 'row', gap: 12}}>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Validade</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#4A5799" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="MM/AA"
                    keyboardType="numeric"
                    maxLength={5}
                    value={validade}
                    onChangeText={handleValidadeChange}
                  />
                </View>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>CVV / CVC</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#4A5799" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.btnConfirmar} onPress={handleConfirmarAssinatura} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnConfirmarTexto}>Confirmar Assinatura • R$ {plano.precoMensal.toFixed(2).replace('.', ',')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, color: '#4A5799', fontWeight: '600' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  titleContainer: { alignItems: 'center', marginVertical: 20 },
  seguroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEFFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  seguroText: { fontSize: 10, color: '#4A5799', fontWeight: 'bold', marginLeft: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#4A5799', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  resumoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F5', marginBottom: 24 },
  resumoInfo: { flex: 1, padding: 20, justifyContent: 'center' },
  badgeContainer: { backgroundColor: '#4A5799', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
  badgeTexto: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  planoNome: { fontSize: 18, fontWeight: 'bold', color: '#4A5799', marginBottom: 2 },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  aulasArea: { backgroundColor: '#7986CB', width: '35%', justifyContent: 'center', alignItems: 'center', padding: 16 },
  aulasNumero: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  aulasTexto: { fontSize: 12, color: '#FFFFFF', textAlign: 'center' },
  metodoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cartaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#4A5799', marginLeft: 8 },
  cartaoMock: { backgroundColor: '#5C6BC0', borderRadius: 24, padding: 24, height: 190, justifyContent: 'space-between', marginBottom: 24 },
  cartaoMockTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartaoMockLabel: { color: '#FFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  cartaoMockCircles: { flexDirection: 'row' },
  circle: { width: 24, height: 24, borderRadius: 12 },
  cartaoNumero: { fontSize: 22, color: '#FFFFFF', letterSpacing: 2, textAlign: 'center' },
  cartaoRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cartaoHint: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', marginBottom: 2, letterSpacing: 1 },
  cartaoTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  formArea: { marginBottom: 24 },
  inputLabel: { fontSize: 12, color: '#666', marginLeft: 4, marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 16, height: 50, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F5' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1A1A1A', fontSize: 14, fontWeight: '500' },
  btnConfirmar: { backgroundColor: '#4A5799', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  btnConfirmarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});