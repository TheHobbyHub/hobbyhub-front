import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { solicitarCodigoRecuperacao, redefinirSenha } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados do fluxo de recuperação
  const [modalVisivel, setModalVisivel] = useState(false);
  const [etapa, setEtapa] = useState(1); // 1 = Email, 2 = Código + Nova Senha
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

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

  const handleSolicitarCodigo = async () => {
    if (!emailRecuperacao.trim()) {
      Alert.alert('Atenção', 'Informe o seu e-mail cadastrado.');
      return;
    }

    try {
      setCarregando(true);
      await solicitarCodigoRecuperacao(emailRecuperacao.trim());
      Alert.alert('Código Enviado', 'Verifique a sua caixa de entrada.');
      setEtapa(2);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao enviar o código. Verifique o e-mail informado.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleRedefinirSenha = async () => {
    if (!codigo.trim() || !novaSenha.trim()) {
      Alert.alert('Atenção', 'Preencha o código e a nova senha.');
      return;
    }

    try {
      setCarregando(true);
      await redefinirSenha(emailRecuperacao.trim(), codigo.trim(), novaSenha.trim());
      Alert.alert('Sucesso', 'Senha alterada com sucesso! Entre com a nova senha.');
      fecharModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Código inválido ou expirado.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setEtapa(1);
    setEmailRecuperacao('');
    setCodigo('');
    setNovaSenha('');
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => {
                setEmailRecuperacao(email);
                setModalVisivel(true);
              }}
            >
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

      {/* Modal de Recuperação de Senha */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {etapa === 1 ? 'Recuperar Senha' : 'Nova Senha'}
            </Text>
            
            <Text style={styles.modalSubtitle}>
              {etapa === 1 
                ? 'Digite seu e-mail para receber um código de recuperação de 6 dígitos.' 
                : 'Insira o código recebido no e-mail e defina a sua nova senha.'}
            </Text>

            {etapa === 1 ? (
              <>
                <Input
                  placeholder="Seu e-mail cadastrado"
                  value={emailRecuperacao}
                  onChangeText={setEmailRecuperacao}
                  keyboardType="email-address"
                />
                
                <View style={{ marginTop: 12 }}>
                  {carregando ? (
                    <ActivityIndicator size="small" color="#7986CB" />
                  ) : (
                    <Button 
                      title="Enviar Código" 
                      variant="primary" 
                      onPress={handleSolicitarCodigo} 
                    />
                  )}
                </View>
              </>
            ) : (
              <>
                <Input
                  placeholder="Código de 6 dígitos"
                  value={codigo}
                  onChangeText={setCodigo}
                  keyboardType="number-pad"
                />

                <Input
                  placeholder="Nova Senha"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                />

                <View style={{ marginTop: 12 }}>
                  {carregando ? (
                    <ActivityIndicator size="small" color="#7986CB" />
                  ) : (
                    <Button 
                      title="Alterar Senha" 
                      variant="primary" 
                      onPress={handleRedefinirSenha} 
                    />
                  )}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.modalCancelButton} onPress={fecharModal}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F3D56',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalCancelButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#9EA0A4',
    fontSize: 14,
    fontWeight: '600',
  },
});