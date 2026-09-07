import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import ilustracaoImg from '../../assets/ilustracao_inicio.png';

export default function WelcomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://');

  useEffect(() => {
    async function checkServer() {
      const savedUrl = await AsyncStorage.getItem('@api_base_url');
      if (!savedUrl) {
        setModalVisible(true);
      } else {
        setServerUrl(savedUrl);
      }
    }
    checkServer();
  }, []);

  const handleSave = async () => {
    const cleanUrl = serverUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      Alert.alert('Formato inválido', 'O endereço deve começar com http:// ou https://');
      return;
    }

    const formattedUrl = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;

    await AsyncStorage.setItem('@api_base_url', formattedUrl);
    setModalVisible(false);
    Alert.alert('Sucesso', 'Servidor configurado com sucesso!');
  };

  return (
    <View style={styles.container}>
      {/* Botão sutil de engrenagem para reconfigurar se necessário */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.settingsButtonText}>⚙</Text>
      </TouchableOpacity>

      <Text style={styles.brandTitle}>HobbyHub</Text>

      <View style={styles.illustrationContainer}>
        <Image
          source={ilustracaoImg}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomArea}>
        <Button
          title="Cadastrar-se"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
        />
        <Button
          title="Entrar"
          variant="primary"
          onPress={() => navigation.navigate('Login')}
        />
      </View>

      {/* Modal de Configuração do Servidor */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Configuração de Servidor</Text>
            <Text style={styles.modalDescription}>
              Informe o endereço IP da máquina executando a API:
            </Text>

            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.15:8080"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1DCF4',
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 56,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 28,
    padding: 8,
    zIndex: 10,
  },
  settingsButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: 240,
  },
  bottomArea: {
    width: '100%',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000000',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3461FD',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});