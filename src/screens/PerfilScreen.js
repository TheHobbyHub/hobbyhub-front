import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AvatarUsuario from '../components/AvatarUsuario';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { getUsuarioLogadoId, buscarUsuario, buscarResumoAssinatura, extrairMensagemErro } from '../services/api';
import appConfig from '../../app.json';

const emBreve = (recurso) => Alert.alert('Em breve', `${recurso} estará disponível em breve.`);

export default function PerfilScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const usuarioId = await getUsuarioLogadoId();
      const [usuario, resumo] = await Promise.all([buscarUsuario(usuarioId), buscarResumoAssinatura(usuarioId)]);
      setDados({ usuario, resumo });
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar seu perfil.'));
    }
  }, []);

  // Recarrega ao voltar de "Dados da Conta" para refletir nome e e-mail alterados
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const onRefresh = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  const sair = () => {
    Alert.alert('Sair da conta', 'Deseja mesmo sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@usuario_logado_id');
          // A API não usa token: basta esquecer o usuário logado. Perfil fica na pilha da aba, dentro das abas,
          // então o reset vai na pilha raiz
          navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (erro && !dados) return <SafeAreaView style={styles.container}><Erro mensagem={erro} onTentarNovamente={carregar} /></SafeAreaView>;
  if (!dados) return <SafeAreaView style={styles.container}><Carregando /></SafeAreaView>;

  const { usuario, resumo } = dados;

  const itensMenu = [
    { icone: 'id-card-outline', titulo: 'Dados Pessoais', descricao: 'Nome, CPF e Nascimento', onPress: () => navigation.navigate('DadosConta') },
    { icone: 'star-outline', titulo: 'Gerenciar Assinatura', descricao: 'Plano atual, créditos e pagamentos', onPress: () => emBreve('O gerenciamento da assinatura') },
    { icone: 'help-circle-outline', titulo: 'Central de Ajuda & FAQ', descricao: 'Dúvidas frequentes e suporte', onPress: () => navigation.navigate('ConteudoEstatico', { tipo: 'ajuda' }) },
    { icone: 'shield-checkmark-outline', titulo: 'Termos de Uso e Privacidade', descricao: 'Políticas do HobbyHub', onPress: () => navigation.navigate('ConteudoEstatico', { tipo: 'termos' }) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={cores.primaria} />}
      >
        <View style={styles.cardPerfil}>
          <AvatarUsuario tamanho={96} verificado={resumo.possuiAssinatura} />
          <Text style={styles.nome}>
            {usuario.nome} {usuario.sobrenome}
          </Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <View style={[styles.plano, !resumo.possuiAssinatura && styles.semPlano]}>
            <Ionicons
              name={resumo.possuiAssinatura ? 'ribbon-outline' : 'remove-circle-outline'}
              size={16}
              color={resumo.possuiAssinatura ? cores.secundaria : cores.textoSecundario}
            />
            <Text style={[styles.planoTexto, !resumo.possuiAssinatura && styles.semPlanoTexto]}>
              {resumo.possuiAssinatura ? resumo.planoNome : 'Sem plano'}
            </Text>
          </View>
        </View>

        <View style={styles.menu}>
          {itensMenu.map((item) => (
            <TouchableOpacity key={item.titulo} style={styles.item} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.itemIcone}>
                <Ionicons name={item.icone} size={20} color={cores.primaria} />
              </View>
              <View style={styles.itemTextos}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.textoSecundario} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.sair} onPress={sair} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={cores.perigoTexto} />
          <Text style={styles.sairTexto}>Sair da conta</Text>
        </TouchableOpacity>
        <Text style={styles.versao}>HobbyHub v{appConfig.expo.version}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  topo: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  cardPerfil: { backgroundColor: cores.superficie, borderRadius: 32, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center', ...sombra },
  nome: { fontSize: 22, fontWeight: '700', color: cores.texto, marginTop: 14, textAlign: 'center' },
  email: { fontSize: 15, color: cores.textoSecundario, marginTop: 4 },
  plano: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.secundariaClara,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 14,
  },
  planoTexto: { fontSize: 14, fontWeight: '600', color: cores.secundaria },
  semPlano: { backgroundColor: cores.superficieBaixa },
  semPlanoTexto: { color: cores.textoSecundario },
  menu: { backgroundColor: cores.superficie, borderRadius: 32, paddingVertical: 8, paddingHorizontal: 14, marginTop: 20, ...sombra },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  itemIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.superficieMedia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextos: { flex: 1 },
  itemTitulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  itemDescricao: { fontSize: 13, color: cores.textoSecundario, marginTop: 1 },
  sair: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.perigoFundo,
    borderRadius: 999,
    paddingHorizontal: 28,
    height: 48,
    marginTop: 32,
  },
  sairTexto: { fontSize: 16, fontWeight: '600', color: cores.perigoTexto },
  versao: { fontSize: 13, color: cores.textoSuave, textAlign: 'center', marginTop: 14 },
});
