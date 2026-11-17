import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import AvatarUsuario from '../components/AvatarUsuario';
import CampoFormulario from '../components/CampoFormulario';
import SecaoFormulario from '../components/SecaoFormulario';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { formatarCpf } from '../utils/validators';
import { formatarTelefone, mascararData, isoParaDataBr, dataBrParaIso } from '../utils/formatters';
import {
  getUsuarioLogadoId,
  buscarUsuario,
  atualizarUsuario,
  extrairMensagemErro,
  extrairErrosDeCampo,
} from '../services/api';

// Usuário da API -> valores exibidos no formulário
const paraFormulario = (usuario) => ({
  nomeCompleto: [usuario.nome, usuario.sobrenome].filter(Boolean).join(' '),
  email: usuario.email || '',
  telefone: formatarTelefone(usuario.telefone),
  dataNascimento: isoParaDataBr(usuario.dataNascimento),
});

// A tela tem um campo só para o nome; a API separa: primeira palavra em "nome", o resto em "sobrenome"
const separarNome = (nomeCompleto) => {
  const [nome, ...resto] = nomeCompleto.trim().split(/\s+/);
  return { nome: nome || '', sobrenome: resto.join(' ') };
};

// Campos da API -> campo da tela onde a mensagem aparece
const CAMPO_DA_TELA = {
  nome: 'nomeCompleto',
  sobrenome: 'nomeCompleto',
  email: 'email',
  telefone: 'telefone',
  dataNascimento: 'dataNascimento',
};

export default function DadosContaScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState(null);
  const [desbloqueados, setDesbloqueados] = useState({ email: false, telefone: false });
  const [erros, setErros] = useState({});
  const [erroCarregar, setErroCarregar] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [focar, setFocar] = useState(null);

  const refs = { email: useRef(null), telefone: useRef(null) };

  const carregar = useCallback(async () => {
    try {
      setErroCarregar(null);
      const dados = await buscarUsuario(await getUsuarioLogadoId());
      setUsuario(dados);
      setForm(paraFormulario(dados));
    } catch (e) {
      setErroCarregar(extrairMensagemErro(e, 'Não foi possível carregar seus dados.'));
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O campo só aceita foco depois de renderizar como editável
  useEffect(() => {
    if (focar) {
      refs[focar].current?.focus();
      setFocar(null);
    }
  }, [focar]);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: null }));
  };

  const desbloquear = (campo) => {
    setDesbloqueados((atual) => ({ ...atual, [campo]: true }));
    setFocar(campo);
  };

  const descartar = () => {
    setForm(paraFormulario(usuario));
    setDesbloqueados({ email: false, telefone: false });
    setErros({});
  };

  const validar = () => {
    const novosErros = {};
    const { nome, sobrenome } = separarNome(form.nomeCompleto);
    if (!nome || !sobrenome) novosErros.nomeCompleto = 'Informe nome e sobrenome';

    if (form.dataNascimento) {
      const iso = dataBrParaIso(form.dataNascimento);
      const hoje = new Date();
      const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
      if (!iso) novosErros.dataNascimento = 'Informe uma data válida no formato dd/mm/aaaa';
      else if (iso >= hojeIso) novosErros.dataNascimento = 'A data de nascimento deve estar no passado';
    }
    return novosErros;
  };

  const salvar = async () => {
    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    const { nome, sobrenome } = separarNome(form.nomeCompleto);
    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(usuario.id, {
        nome,
        sobrenome,
        email: form.email.trim(),
        telefone: form.telefone.replace(/\D/g, ''),
        dataNascimento: form.dataNascimento ? dataBrParaIso(form.dataNascimento) : null,
      });
      // O app guarda só o id do usuário; a tela Perfil busca os dados de novo ao ganhar foco
      setUsuario(atualizado);
      setForm(paraFormulario(atualizado));
      setDesbloqueados({ email: false, telefone: false });
      Alert.alert('Dados atualizados', 'Suas informações foram salvas com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const errosApi = extrairErrosDeCampo(e);
      if (!errosApi) {
        Alert.alert('Não foi possível salvar', extrairMensagemErro(e, 'Tente novamente em instantes.'));
        return;
      }
      const naTela = {};
      const semCampo = [];
      Object.entries(errosApi).forEach(([campo, mensagem]) => {
        const destino = CAMPO_DA_TELA[campo];
        if (destino) naTela[destino] = naTela[destino] || mensagem;
        else semCampo.push(mensagem);
      });
      setErros(naTela);
      // Libera e-mail/telefone com erro para a pessoa poder corrigir
      setDesbloqueados((atual) => ({ email: atual.email || !!naTela.email, telefone: atual.telefone || !!naTela.telefone }));
      if (semCampo.length) Alert.alert('Não foi possível salvar', semCampo.join('\n'));
    } finally {
      setSalvando(false);
    }
  };

  if (erroCarregar && !usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader titulo="Dados da Conta" onVoltar={() => navigation.goBack()} />
        <Erro mensagem={erroCarregar} onTentarNovamente={carregar} />
      </SafeAreaView>
    );
  }
  if (!form) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader titulo="Dados da Conta" onVoltar={() => navigation.goBack()} />
        <Carregando />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Dados da Conta" onVoltar={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.cabecalho}>
            <AvatarUsuario tamanho={112} />
            <Text style={styles.nome}>
              {usuario.nome} {usuario.sobrenome}
            </Text>
          </View>

          <SecaoFormulario icone="id-card-outline" titulo="Informações Pessoais">
            <CampoFormulario
              rotulo="Nome completo"
              value={form.nomeCompleto}
              onChangeText={(v) => alterar('nomeCompleto', v)}
              erro={erros.nomeCompleto}
              autoCapitalize="words"
              placeholder="Nome e sobrenome"
            />
            <CampoFormulario rotulo="CPF" value={formatarCpf(usuario.cpf || '')} editavel={false} />
            <CampoFormulario
              rotulo="Data de nascimento"
              value={form.dataNascimento}
              onChangeText={(v) => alterar('dataNascimento', mascararData(v))}
              erro={erros.dataNascimento}
              keyboardType="number-pad"
              placeholder="dd/mm/aaaa"
              maxLength={10}
            />
          </SecaoFormulario>

          <SecaoFormulario icone="at" titulo="Contato">
            <CampoFormulario
              ref={refs.email}
              rotulo="E-mail"
              value={form.email}
              onChangeText={(v) => alterar('email', v)}
              erro={erros.email}
              editavel={desbloqueados.email}
              acao={desbloqueados.email ? null : 'Editar'}
              onAcao={() => desbloquear('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <CampoFormulario
              ref={refs.telefone}
              rotulo="Telefone / WhatsApp"
              value={form.telefone}
              onChangeText={(v) => alterar('telefone', formatarTelefone(v))}
              erro={erros.telefone}
              editavel={desbloqueados.telefone}
              acao={desbloqueados.telefone ? null : 'Editar'}
              onAcao={() => desbloquear('telefone')}
              keyboardType="phone-pad"
              placeholder="(11) 98765-4321"
            />
          </SecaoFormulario>

          <SecaoFormulario icone="lock-closed-outline" titulo="Segurança da Conta">
            <CampoFormulario
              rotulo="Senha"
              value="••••••••"
              editavel={false}
              acao="Alterar"
              onAcao={() => navigation.navigate('AlterarSenha')}
            />
          </SecaoFormulario>

          <TouchableOpacity style={[styles.salvar, salvando && styles.salvarDesabilitado]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.salvarTexto}>Salvar Alterações</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.descartar} onPress={descartar} disabled={salvando} hitSlop={8}>
            <Text style={styles.descartarTexto}>Descartar</Text>
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
  cabecalho: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
  nome: { fontSize: 20, fontWeight: '600', color: cores.texto, marginTop: 10 },
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
  descartar: { alignSelf: 'center', marginTop: 20, padding: 4 },
  descartarTexto: { fontSize: 16, fontWeight: '600', color: cores.secundaria },
});
