import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Button from '../components/Button';
import ilustracaoImg from '../../assets/ilustracao_inicio.png';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1DCF4',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 260,
  },
  bottomArea: {
    width: '100%',
  },
});