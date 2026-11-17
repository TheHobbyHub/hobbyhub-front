import React, { forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { cores } from '../theme';

// Campo com rótulo, mensagem de erro embaixo e ação opcional à direita ("Editar", "Alterar")
const CampoFormulario = forwardRef(function CampoFormulario(
  { rotulo, erro, editavel = true, acao, onAcao, style, ...inputProps },
  ref
) {
  return (
    <View style={[styles.campo, style]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, !editavel && styles.caixaBloqueada, erro && styles.caixaErro]}>
        <TextInput
          ref={ref}
          style={[styles.input, !editavel && styles.inputBloqueado]}
          editable={editavel}
          placeholderTextColor={cores.textoSuave}
          {...inputProps}
        />
        {acao && (
          <TouchableOpacity onPress={onAcao} hitSlop={8}>
            <Text style={styles.acao}>{acao}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
});

export default CampoFormulario;

const styles = StyleSheet.create({
  campo: { marginTop: 16 },
  rotulo: { fontSize: 13, fontWeight: '600', color: cores.textoSecundario, marginBottom: 6 },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficieBaixa,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 18,
    minHeight: 56,
  },
  caixaBloqueada: { backgroundColor: cores.superficieMedia },
  caixaErro: { borderColor: cores.perigo },
  input: { flex: 1, fontSize: 15, color: cores.texto, paddingVertical: 14 },
  inputBloqueado: { color: cores.textoSuave },
  acao: { fontSize: 14, fontWeight: '600', color: cores.primaria, marginLeft: 12 },
  erro: { fontSize: 12, color: cores.perigoTexto, marginTop: 6, marginLeft: 4 },
});
