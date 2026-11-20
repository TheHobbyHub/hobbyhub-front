import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import CartaoVisual from '../components/CartaoVisual';
import CampoFormulario from '../components/CampoFormulario';
import SecaoFormulario from '../components/SecaoFormulario';
import { cores, sombra } from '../theme';
import { mascararNumeroCartao, mascararValidadeCartao } from '../utils/formatters';
import { validarCartao } from '../utils/validators';
import { getUsuarioLogadoId, trocarCartao, extrairMensagemErro, extrairErrosDeCampo } from '../services/api';

const FORM_VAZIO = { numero: '', nomeTitular: '', validade: '', cvv: '' };

export default function TrocarCartaoScreen({ navigation, route }) {
  const cartaoAtual = route.params?.cartaoAtual;
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: null }));
  };

  const salvar = async () => {
    const novosErros = validarCartao(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    try {
      const usuarioId = await getUsuarioLogadoId();
      const cartao = await trocarCartao(usuarioId, {
        numero: form.numero.replace(/\D/g, ''),
        nomeTitular: form.nomeTitular.trim(),
        validade: form.validade,
      });
      Alert.alert('Cartão atualizado', `As próximas cobranças serão feitas no cartão final ${cartao.ultimosDigitos}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const errosApi = extrairErrosDeCampo(e);
      if (errosApi) setErros(errosApi);
      else Alert.alert('Não foi possível salvar', extrairMensagemErro(e, 'Tente novamente em instantes.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo={cartaoAtual ? 'Trocar Cartão' : 'Adicionar Cartão'} onVoltar={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {cartaoAtual && (
            <View style={styles.atual}>
              <Ionicons name="card-outline" size={20} color={cores.textoSecundario} />
              <Text style={styles.atualTexto}>
                Cartão atual: <Text style={styles.negrito}>•••• {cartaoAtual.ultimosDigitos}</Text>
              </Text>
            </View>
          )}

          <CartaoVisual numero={form.numero} nomeTitular={form.nomeTitular} validade={form.validade} />

          <SecaoFormulario icone="card-outline" titulo="Novo cartão">
            <CampoFormulario
              rotulo="Número do cartão"
              value={form.numero}
              onChangeText={(v) => alterar('numero', mascararNumeroCartao(v))}
              erro={erros.numero}
              keyboardType="number-pad"
              placeholder="0000 0000 0000 0000"
              maxLength={23}
            />
            <CampoFormulario
              rotulo="Nome impresso"
              value={form.nomeTitular}
              onChangeText={(v) => alterar('nomeTitular', v)}
              erro={erros.nomeTitular}
              autoCapitalize="characters"
              placeholder="Como está no cartão"
            />
            <View style={styles.linha}>
              <CampoFormulario
                style={styles.metade}
                rotulo="Validade"
                value={form.validade}
                onChangeText={(v) => alterar('validade', mascararValidadeCartao(v))}
                erro={erros.validade}
                keyboardType="number-pad"
                placeholder="MM/AA"
                maxLength={5}
              />
              <CampoFormulario
                style={styles.metade}
                rotulo="CVV"
                value={form.cvv}
                onChangeText={(v) => alterar('cvv', v.replace(/\D/g, ''))}
                erro={erros.cvv}
                keyboardType="number-pad"
                placeholder="123"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </SecaoFormulario>

          <View style={styles.aviso}>
            <Ionicons name="shield-checkmark-outline" size={18} color={cores.secundaria} />
            <Text style={styles.avisoTexto}>
              O novo cartão será usado nas próximas renovações e upgrades. Não guardamos o número completo nem o CVV.
            </Text>
          </View>

          <TouchableOpacity style={[styles.salvar, salvando && styles.salvarDesabilitado]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.salvarTexto}>Salvar cartão</Text>
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
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  negrito: { fontWeight: '700', color: cores.texto },
  atual: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  atualTexto: { fontSize: 14, color: cores.textoSecundario },
  linha: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
  aviso: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 20, paddingHorizontal: 4 },
  avisoTexto: { flex: 1, fontSize: 13, color: cores.textoSecundario, lineHeight: 19 },
  salvar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 60,
    marginTop: 28,
    ...sombra,
    shadowOpacity: 0.25,
  },
  salvarDesabilitado: { opacity: 0.7 },
  salvarTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
