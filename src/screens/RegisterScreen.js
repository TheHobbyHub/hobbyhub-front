import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const formatarCpf = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handleChange = (campo, valor) => {
    if (campo === 'cpf') {
      setFormData(prev => ({ ...prev, cpf: formatarCpf(valor) }));
      return;
    }
    if (campo === 'telefone') {
      setFormData(prev => ({ ...prev, telefone: formatarTelefone(valor) }));
      return;
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email.trim());
  };

  const validarSenhaForte = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(senha);
  };

  const handleRegister = async () => {
    const { nome, sobrenome, cpf, telefone, email, senha, confirmarSenha } = formData;

    // Se faltar qualquer campo com *
    if (
      !nome.trim() ||
      !sobrenome.trim() ||
      !cpf.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Informe um e-mail válido (ex: exemplo@dominio.com).');
      return;
    }

    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length !== 11) {
      Alert.alert('Atenção', 'O CPF deve conter exatamente 11 dígitos numéricos.');
      return;
    }

    const telNumeros = telefone.replace(/\D/g, '');
    if (telNumeros.length < 10 || telNumeros.length > 11) {
      Alert.alert('Atenção', 'O telefone deve conter 10 ou 11 dígitos numéricos com DDD.');
      return;
    }

    if (!validarSenhaForte(senha)) {
      Alert.alert(
        'Senha fraca',
        'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial (@$!%*?&#).'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      const response = await api.post('/usuarios', {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        cpf: cpfNumeros,
        telefone: telNumeros,
        email: email.trim().toLowerCase(),
        senha,
      });

      Alert.alert('Sucesso', 'Cadastro concluído com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      console.log('Resposta Spring Boot:', response.data);
    } catch (error) {
      console.log('Erro retornado:', error.response?.data);
      const data = error.response?.data;

      // Trata as mensagens vindas do GlobalExceptionHandler
      if (data && typeof data === 'object' && !data.mensagem && !data.message) {
        const primeiroErro = Object.values(data)[0];
        Alert.alert('Atenção', primeiroErro);
        return;
      }

      const msg = data?.mensagem || data?.message || 'Falha ao realizar cadastro.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para começar.</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Nome *"
              value={formData.nome}
              onChangeText={(v) => handleChange('nome', v)}
            />
            <Input
              placeholder="Sobrenome *"
              value={formData.sobrenome}
              onChangeText={(v) => handleChange('sobrenome', v)}
            />
            <Input
              placeholder="CPF * (000.000.000-00)"
              value={formData.cpf}
              onChangeText={(v) => handleChange('cpf', v)}
              keyboardType="numeric"
              maxLength={14}
            />
            <Input
              placeholder="Telefone * (DDD + número)"
              value={formData.telefone}
              onChangeText={(v) => handleChange('telefone', v)}
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Input
              placeholder="E-mail *"
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              placeholder="Senha *"
              value={formData.senha}
              onChangeText={(v) => handleChange('senha', v)}
              secureTextEntry
            />
            <Input
              placeholder="Confirme sua senha *"
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
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
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