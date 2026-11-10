import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { getUsuarioLogadoId, buscarUsuario, extrairMensagemErro } from '../services/api';

// Versão inicial do Perfil: dados básicos e saída da conta. O layout completo (figma 2/perfil.png) fica para outra entrega.
export default function PerfilScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setUsuario(await buscarUsuario(await getUsuarioLogadoId()));
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar seu perfil.'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const sair = async () => {
    await AsyncStorage.removeItem('@usuario_logado_id');
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  if (erro && !usuario) return <SafeAreaView style={styles.container}><Erro mensagem={erro} onTentarNovamente={carregar} /></SafeAreaView>;
  if (!usuario) return <SafeAreaView style={styles.container}><Carregando /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.titulo}>Perfil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {usuario.nome?.[0]}
            {usuario.sobrenome?.[0]}
          </Text>
        </View>
        <Text style={styles.nome}>
          {usuario.nome} {usuario.sobrenome}
        </Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <View style={styles.saldo}>
          <Ionicons name="ticket-outline" size={18} color={cores.primaria} />
          <Text style={styles.saldoTexto}>
            {usuario.saldoCreditos ?? 0} {usuario.saldoCreditos === 1 ? 'crédito disponível' : 'créditos disponíveis'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.sair} onPress={sair}>
        <Ionicons name="log-out-outline" size={20} color={cores.perigo} />
        <Text style={styles.sairTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 24 },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto, paddingTop: 12 },
  card: { backgroundColor: cores.superficie, borderRadius: 28, padding: 24, alignItems: 'center', marginTop: 20, ...sombra },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: { fontSize: 28, fontWeight: '700', color: cores.secundaria },
  nome: { fontSize: 20, fontWeight: '600', color: cores.texto, marginTop: 12 },
  email: { fontSize: 14, color: cores.textoSecundario, marginTop: 2 },
  saldo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficieBaixa,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  saldoTexto: { fontSize: 14, color: cores.texto, fontWeight: '500' },
  sair: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    height: 56,
    marginTop: 24,
  },
  sairTexto: { fontSize: 16, fontWeight: '600', color: cores.perigo },
});
