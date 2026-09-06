import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      const response = await api.post('/usuarios/login', {
        email: email,
        senha: senha,
      });

      Alert.alert('Sucesso', 'Login efetuado com sucesso!');
      console.log('Resposta Spring Boot:', response.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Falha ao conectar ao servidor.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        <SafeAreaView style={styles.topArea}>
          <Text style={styles.brandTitle}>HobbyHub</Text>
        </SafeAreaView>

        <View style={styles.card}>
          <View>
            <View style={styles.headerCard}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              
              <Text style={styles.cardTitle}>Bem-vindo(a)</Text>
            </View>

            <Input
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Input
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionContainer}>
            <Button
              title="Entrar"
              variant="primary"
              onPress={handleLogin}
            />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#D1DCF4',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topArea: {
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 36,
    minHeight: '65%',
    justifyContent: 'space-between',
  },
  headerCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    minHeight: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7986CB',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F3D56',
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#9EA0A4',
    fontSize: 13,
  },
  actionContainer: {
    marginTop: 16,
  },
});