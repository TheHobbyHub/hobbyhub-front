import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleRegister = async () => {
    if (!formData.nome || !formData.cpf || !formData.email || !formData.senha) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      const response = await api.post('/usuarios', {
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
      });

      Alert.alert('Sucesso', 'Cadastro concluído com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
      console.log('Resposta Spring Boot:', response.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Falha ao realizar cadastro.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para começar.</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Nome"
            value={formData.nome}
            onChangeText={(v) => handleChange('nome', v)}
          />
          <Input
            placeholder="Sobrenome"
            value={formData.sobrenome}
            onChangeText={(v) => handleChange('sobrenome', v)}
          />
          {/* NOVO CAMPO DE CPF */}
          <Input
            placeholder="CPF"
            value={formData.cpf}
            onChangeText={(v) => handleChange('cpf', v)}
            keyboardType="numeric"
          />
          <Input
            placeholder="Telefone"
            value={formData.telefone}
            onChangeText={(v) => handleChange('telefone', v)}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="E-mail"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
          />
          <Input
            placeholder="Senha"
            value={formData.senha}
            onChangeText={(v) => handleChange('senha', v)}
            secureTextEntry
          />
          <Input
            placeholder="Confirme sua senha"
            value={formData.confirmarSenha}
            onChangeText={(v) => handleChange('confirmarSenha', v)}
            secureTextEntry
          />
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Cadastrar-se"
            variant="primary"
            onPress={handleRegister}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backIcon: {
    fontSize: 26,
    color: '#7986CB',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F3D56',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#7C7C7C',
  },
  form: {
    width: '100%',
  },
  actionContainer: {
    marginTop: 16,
  },
});