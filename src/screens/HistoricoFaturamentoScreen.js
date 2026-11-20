import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import FaturaItem from '../components/FaturaItem';
import { Carregando, Erro, Vazio } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { formatarPreco } from '../utils/formatters';
import { getUsuarioLogadoId, listarFaturas, extrairMensagemErro } from '../services/api';

// As faturas já chegam da mais recente para a mais antiga; agrupa por ano mantendo essa ordem
const agruparPorAno = (faturas) =>
  faturas.reduce((grupos, fatura) => {
    const ano = fatura.data.slice(0, 4);
    const grupo = grupos.find((g) => g.ano === ano);
    if (grupo) grupo.faturas.push(fatura);
    else grupos.push({ ano, faturas: [fatura] });
    return grupos;
  }, []);

export default function HistoricoFaturamentoScreen({ navigation }) {
  const [faturas, setFaturas] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setFaturas(await listarFaturas(await getUsuarioLogadoId()));
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar o histórico.'));
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const onRefresh = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  const conteudo = () => {
    if (erro && !faturas) return <Erro mensagem={erro} onTentarNovamente={carregar} />;
    if (!faturas) return <Carregando />;

    const totalPago = faturas.reduce((soma, f) => soma + Number(f.valor), 0);

    return (
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={cores.primaria} />}
      >
        {faturas.length === 0 ? (
          <Vazio icone="receipt-outline" titulo="Nenhuma fatura ainda" descricao="As cobranças da sua assinatura aparecerão aqui." />
        ) : (
          <>
            <View style={styles.resumo}>
              <View>
                <Text style={styles.resumoRotulo}>Total pago</Text>
                <Text style={styles.resumoValor}>{formatarPreco(totalPago)}</Text>
              </View>
              <View style={styles.resumoDireita}>
                <Text style={styles.resumoRotulo}>Faturas</Text>
                <Text style={styles.resumoQuantidade}>{faturas.length}</Text>
              </View>
            </View>

            {agruparPorAno(faturas).map((grupo) => (
              <View key={grupo.ano}>
                <Text style={styles.ano}>{grupo.ano}</Text>
                <View style={styles.card}>
                  {grupo.faturas.map((fatura, indice) => (
                    <View key={fatura.id} style={indice > 0 && styles.separador}>
                      <FaturaItem fatura={fatura} />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo="Histórico de Faturamento" onVoltar={() => navigation.goBack()} />
      {conteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  resumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 20,
    ...sombra,
    shadowOpacity: 0.25,
  },
  resumoDireita: { alignItems: 'flex-end' },
  resumoRotulo: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  resumoValor: { fontSize: 26, fontWeight: '700', color: '#FFF', marginTop: 2 },
  resumoQuantidade: { fontSize: 26, fontWeight: '700', color: '#FFF', marginTop: 2 },
  ano: { fontSize: 18, fontWeight: '600', color: cores.texto, marginTop: 24, marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: cores.superficie, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 6, ...sombra },
  separador: { borderTopWidth: 1, borderTopColor: cores.superficieMedia },
});
