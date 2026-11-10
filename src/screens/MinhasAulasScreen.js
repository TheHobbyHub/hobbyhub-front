import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AgendamentoCard from '../components/AgendamentoCard';
import { Carregando, Erro, Vazio } from '../components/EstadoTela';
import { cores } from '../theme';
import { getUsuarioLogadoId, listarAgendamentos, extrairMensagemErro } from '../services/api';

const ABAS = [
  { chave: 'proximas', rotulo: 'Próximas', titulo: 'Próximas Aulas' },
  { chave: 'concluidas', rotulo: 'Concluídas', titulo: 'Histórico' },
];

export default function MinhasAulasScreen({ navigation, route }) {
  const [aba, setAba] = useState(route.params?.aba || 'proximas');
  const [listas, setListas] = useState({});
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  // Outras telas podem abrir a Agenda já numa aba específica
  useEffect(() => {
    if (route.params?.aba) {
      setAba(route.params.aba);
      navigation.setParams({ aba: undefined });
    }
  }, [route.params?.aba, navigation]);

  const carregar = useCallback(async (tipo) => {
    try {
      setErro(null);
      const usuarioId = await getUsuarioLogadoId();
      const resultado = await listarAgendamentos(usuarioId, tipo);
      setListas((atual) => ({ ...atual, [tipo]: resultado }));
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar suas aulas.'));
    }
  }, []);

  // Recarrega ao entrar na aba, já que agendar, reagendar e cancelar acontecem em outras telas
  useFocusEffect(
    useCallback(() => {
      carregar(aba);
    }, [carregar, aba])
  );

  const onRefresh = async () => {
    setAtualizando(true);
    await carregar(aba);
    setAtualizando(false);
  };

  const reagendar = (agendamento) => {
    if (!agendamento.alteracaoGratuita) {
      Alert.alert(
        'Reagendamento indisponível',
        'O reagendamento só é permitido com no mínimo 24 horas de antecedência. Sua vaga continua reservada. ' +
          'Se preferir, você ainda pode cancelar, mas o crédito não será devolvido.'
      );
      return;
    }
    navigation.navigate('ReagendarAula', { agendamento });
  };

  const lista = listas[aba];
  const abaAtual = ABAS.find((a) => a.chave === aba);

  const renderItem = ({ item }) => (
    <AgendamentoCard agendamento={item}>
      {aba === 'proximas' ? (
        <>
          {!item.alteracaoGratuita && (
            <View style={styles.alerta}>
              <Ionicons name="information-circle-outline" size={18} color={cores.perigoTexto} />
              <Text style={styles.alertaTexto}>
                <Text style={styles.alertaNegrito}>Atenção: </Text>
                faltam menos de 24h para a aula. Não é mais possível reagendar e, se cancelar, o crédito não será devolvido.
              </Text>
            </View>
          )}
          <View style={styles.acoes}>
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: cores.primaria }, !item.alteracaoGratuita && styles.botaoInativo]}
              onPress={() => reagendar(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="sync-outline" size={18} color="#FFF" />
              <Text style={styles.botaoTexto}>Reagendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: cores.perigo }]}
              onPress={() => navigation.navigate('CancelarAula', { agendamento: item })}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color="#FFF" />
              <Text style={styles.botaoTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.botao, styles.botaoCheio, { backgroundColor: cores.primaria }]}
          onPress={() => navigation.navigate('AgendarAula', { aulaId: item.aulaId })}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={18} color="#FFF" />
          <Text style={styles.botaoTexto}>Agendar Novamente</Text>
        </TouchableOpacity>
      )}
    </AgendamentoCard>
  );

  const vazio = () => {
    if (erro) return <Erro mensagem={erro} onTentarNovamente={() => carregar(aba)} />;
    if (!lista) return <Carregando />;
    return aba === 'proximas' ? (
      <Vazio
        titulo="Nenhuma aula agendada"
        descricao="Explore as oficinas disponíveis no seu plano e reserve sua próxima experiência."
        acao="Explorar aulas"
        onAcao={() => navigation.navigate('Explorar')}
      />
    ) : (
      <Vazio
        icone="time-outline"
        titulo="Nenhuma aula concluída ainda"
        descricao="As aulas que você fizer aparecerão aqui."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.titulo}>Minhas Aulas</Text>

      <View style={styles.segmento}>
        {ABAS.map((item) => {
          const ativa = item.chave === aba;
          return (
            <TouchableOpacity
              key={item.chave}
              style={[styles.segmentoItem, ativa && styles.segmentoAtivo]}
              onPress={() => setAba(item.chave)}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativa }}
            >
              <Text style={[styles.segmentoTexto, ativa && styles.segmentoTextoAtivo]}>{item.rotulo}</Text>
              {ativa && <View style={styles.segmentoPonto} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={erro ? [] : lista || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.secao}>{abaAtual.titulo}</Text>}
        ListEmptyComponent={vazio()}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={cores.primaria} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto, paddingHorizontal: 24, paddingTop: 12 },
  segmento: {
    flexDirection: 'row',
    backgroundColor: cores.superficieMedia,
    borderRadius: 999,
    padding: 5,
    marginHorizontal: 24,
    marginTop: 16,
  },
  segmentoItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
  },
  segmentoAtivo: {
    backgroundColor: cores.superficie,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentoTexto: { fontSize: 15, color: cores.textoSecundario, fontWeight: '500' },
  segmentoTextoAtivo: { color: cores.primaria, fontWeight: '600' },
  segmentoPonto: { width: 7, height: 7, borderRadius: 4, backgroundColor: cores.primaria },
  lista: { paddingHorizontal: 24, paddingBottom: 32, flexGrow: 1 },
  secao: { fontSize: 20, fontWeight: '500', color: cores.texto, marginTop: 20, marginBottom: 14 },
  alerta: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: cores.perigoFundo,
    borderWidth: 1,
    borderColor: '#F2C9C9',
    padding: 12,
    marginTop: 14,
  },
  alertaTexto: { flex: 1, fontSize: 13, color: cores.perigoTexto, lineHeight: 18 },
  alertaNegrito: { fontWeight: '700' },
  acoes: { flexDirection: 'row', gap: 12, marginTop: 16 },
  botao: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 52,
    borderRadius: 999,
  },
  botaoCheio: { flex: 0, marginTop: 16 },
  botaoInativo: { opacity: 0.55 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
