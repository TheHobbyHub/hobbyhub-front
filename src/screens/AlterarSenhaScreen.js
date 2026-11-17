import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import CampoFormulario from '../components/CampoFormulario';
import SecaoFormulario from '../components/SecaoFormulario';
import { cores, sombra } from '../theme';
import { validarSenhaForte } from '../utils/validators';
import { getUsuarioLogadoId, alterarSenha, extrairMensagemErro, extrairErrosDeCampo } from '../services/api';

const REGRA_SENHA = 'Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e um destes especiais: @$!%*?&#';

export default function AlterarSenhaScreen({ navigation }) {
  const [form, setForm] = useState({ senhaAtual: '', novaSenha: '', confirmacao: '' });
  const [visiveis, setVisiveis] = useState({});
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: null }));
  };

  const alternarVisivel = (campo) => setVisiveis((atual) => ({ ...atual, [campo]: !atual[campo] }));

  const validar = () => {
    const novosErros = {};
    if (!form.senhaAtual) novosErros.senhaAtual = 'Informe sua senha atual';
    if (!form.novaSenha) novosErros.novaSenha = 'Informe a nova senha';
    else if (!validarSenhaForte(form.novaSenha)) novosErros.novaSenha = REGRA_SENHA;
    // A confirmação é validada só aqui; a API recebe apenas senhaAtual e novaSenha
    if (form.confirmacao !== form.novaSenha) novosErros.confirmacao = 'As senhas não coincidem';
    return novosErros;
  };

  const salvar = async () => {
    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    try {
      const resposta = await alterarSenha(await getUsuarioLogadoId(), form.senhaAtual, form.novaSenha);
      Alert.alert('Senha alterada', resposta?.mensagem || 'Senha alterada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const errosApi = extrairErrosDeCampo(e);
      if (errosApi) setErros(errosApi);
      else Alert.alert('Não foi possível alterar a senha', extrairMensagemErro(e, 'Tente novamente em instantes.'));
    } finally {
      setSalvando(false);
    }
  };

  const campoSenha = (campo, rotulo) => (
    <CampoFormulario
      rotulo={rotulo}
      value={form[campo]}
      onChangeText={(v) => alterar(campo, v)}
      erro={erros[campo]}
      secureTextEntry={!visiveis[campo]}
      acao={visiveis[campo] ? 'Ocultar' : 'Mostrar'}
      onAcao={() => alternarVisivel(campo)}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Alterar Senha" onVoltar={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SecaoFormulario icone="lock-closed-outline" titulo="Nova senha">
            {campoSenha('senhaAtual', 'Senha atual')}
            {campoSenha('novaSenha', 'Nova senha')}
            {!erros.novaSenha && <Text style={styles.dica}>{REGRA_SENHA}</Text>}
            {campoSenha('confirmacao', 'Confirmar nova senha')}
          </SecaoFormulario>

          <TouchableOpacity style={[styles.salvar, salvando && styles.salvarDesabilitado]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.salvarTexto}>Salvar Nova Senha</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120 },
  dica: { fontSize: 12, color: cores.textoSuave, marginTop: 6, marginLeft: 4, lineHeight: 17 },
  salvar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    marginTop: 32,
    ...sombra,
    shadowOpacity: 0.25,
  },
  salvarDesabilitado: { opacity: 0.7 },
  salvarTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
