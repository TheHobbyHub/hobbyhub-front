import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AulaCard from '../components/AulaCard';
import { Carregando, Erro } from '../components/EstadoTela';
import { cores, sombra } from '../theme';
import { formatarPreco, formatarDiaMesAbreviado } from '../utils/formatters';
import {
  getUsuarioLogadoId,
  buscarUsuario,
  buscarResumoAssinatura,
  listarPlanos,
  listarCategorias,
  listarAulas,
  extrairMensagemErro,
} from '../services/api';

export default function HomeScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const usuarioId = await getUsuarioLogadoId();
      const [usuario, resumo, planos, categorias, destaques] = await Promise.all([
        buscarUsuario(usuarioId),
        buscarResumoAssinatura(usuarioId),
        listarPlanos(),
        listarCategorias(),
        listarAulas({ usuarioId, destaque: true }),
      ]);
      setDados({ usuario, resumo, planos, categorias, destaques });
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar a tela inicial.'));
    }
  }, []);

  // Recarrega ao voltar para a aba, para o saldo refletir agendamentos e cancelamentos
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

  if (erro && !dados) return <SafeAreaView style={styles.container}><Erro mensagem={erro} onTentarNovamente={carregar} /></SafeAreaView>;
  if (!dados) return <SafeAreaView style={styles.container}><Carregando /></SafeAreaView>;

  const { usuario, resumo, planos, categorias, destaques } = dados;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topo}>
        <View style={styles.logo}>
          <Ionicons name="color-palette-outline" size={20} color={cores.secundaria} />
        </View>
        <Text style={styles.marca}>HobbyHub</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={cores.primaria} />}
      >
        <Text style={styles.ola}>Olá, {usuario.nome}! 👋</Text>
        <Text style={styles.subtitulo}>Descubra oficinas criativas e novos hobbies perto de você.</Text>

        {resumo.possuiAssinatura ? (
          <CardAssinaturaAtiva resumo={resumo} />
        ) : (
          <CardSemAssinatura planos={planos} onConhecerPlanos={() => navigation.navigate('Planos')} />
        )}

        <View style={styles.secaoHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.secaoTitulo}>Categorias de Hobbies</Text>
            <Text style={styles.secaoSub}>Experimente diferentes linguagens manuais</Text>
          </View>
          <Text style={styles.secaoContador}>{categorias.length} áreas</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorias}
          style={styles.categoriasScroll}
        >
          {categorias.map((categoria, indice) => (
            <TouchableOpacity
              key={categoria.id}
              style={[styles.chip, indice === 0 && styles.chipDestaque]}
              onPress={() =>
                navigation.navigate('Explorar', { screen: 'ExplorarAulas', params: { categoriaId: categoria.id } })
              }
            >
              <MaterialCommunityIcons name={categoria.icone || 'palette-outline'} size={18} color={cores.primaria} />
              <Text style={styles.chipTexto}>{categoria.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.secaoTitulo}>Ateliês em destaque</Text>
        <Text style={[styles.secaoSub, { marginBottom: 16 }]}>Estúdios parceiros prontos para te receber</Text>

        {destaques.map((aula) => (
          <AulaCard key={aula.id} aula={aula} onPress={() => navigation.navigate('DetalhesAula', { aulaId: aula.id })} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function CardSemAssinatura({ planos, onConhecerPlanos }) {
  const recomendado = planos.find((p) => p.recomendado) || planos[0];
  const menorPreco = planos.length ? Math.min(...planos.map((p) => p.precoMensal)) : null;

  return (
    <View style={styles.cardPlano}>
      <View style={styles.cardPlanoTopo}>
        {recomendado && (
          <View style={styles.pill}>
            <Text style={styles.pillTexto}>
              {recomendado.creditosMensais} aulas inclusas no {recomendado.nome}
            </Text>
          </View>
        )}
        <View style={styles.pontoRoxo} />
      </View>
      <Text style={styles.cardPlanoTitulo}>Desbloqueie aulas todo mês</Text>
      <Text style={styles.cardPlanoTexto}>
        Assine um plano{menorPreco !== null && <> a partir de <Text style={styles.negrito}>{formatarPreco(menorPreco)}</Text></>} e
        pratique cerâmica, marcenaria, pintura e muito mais com flexibilidade total.
      </Text>
      <View style={styles.faixa}>
        <Ionicons name="calendar-outline" size={18} color={cores.textoSecundario} />
        <Text style={styles.faixaTexto}>Cancele quando quiser</Text>
      </View>
      <TouchableOpacity style={styles.botaoPrimario} onPress={onConhecerPlanos} activeOpacity={0.85}>
        <Ionicons name="star" size={18} color="#FFF" />
        <Text style={styles.botaoPrimarioTexto}>Conhecer planos</Text>
      </TouchableOpacity>
    </View>
  );
}

function CardAssinaturaAtiva({ resumo }) {
  const total = resumo.creditosMensais || 0;
  const saldo = resumo.saldoCreditos || 0;
  const concluidas = resumo.aulasConcluidasNoCiclo || 0;
  const percentual = total > 0 ? Math.round((saldo / total) * 100) : 0;

  return (
    <View style={styles.cardPlano}>
      <View style={styles.cardPlanoTopo}>
        <View style={styles.pill}>
          <Text style={styles.pillTexto}>{resumo.planoNome} Ativo</Text>
        </View>
        {resumo.dataRenovacao && (
          <View style={styles.renova}>
            <Ionicons name="calendar-outline" size={15} color={cores.textoSecundario} />
            <Text style={styles.renovaTexto}>Renova em {formatarDiaMesAbreviado(resumo.dataRenovacao)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.saldoRotulo}>SALDO DESTE CICLO</Text>
      <View style={styles.saldoLinha}>
        <Text style={styles.saldoNumero}>{String(saldo).padStart(2, '0')}</Text>
        <Text style={styles.saldoTexto}>{saldo === 1 ? 'aula restante' : 'aulas restantes'}</Text>
        <Text style={styles.saldoTotal}>(de {total} totais)</Text>
      </View>
      <Text style={styles.cardPlanoTexto}>
        Aproveite seus créditos para agendar oficinas de cerâmica, pintura ou gastronomia quando quiser.
      </Text>

      <View style={styles.progressoBox}>
        <View style={styles.progressoTopo}>
          <View style={styles.progressoLabel}>
            <Ionicons name="color-palette-outline" size={15} color={cores.textoSecundario} />
            <Text style={styles.progressoTexto}>
              {concluidas} {concluidas === 1 ? 'aula concluída' : 'aulas concluídas'}
            </Text>
          </View>
          <Text style={styles.progressoPercentual}>{percentual}% restante</Text>
        </View>
        <View style={styles.trilha}>
          <View style={[styles.trilhaUsada, { flex: 100 - percentual }]} />
          <View style={[styles.trilhaRestante, { flex: percentual }]} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botaoPrimario, { backgroundColor: cores.secundaria }]}
        onPress={() => Alert.alert('Em breve', 'O gerenciamento da assinatura estará disponível em breve.')}
        activeOpacity={0.85}
      >
        <Ionicons name="options-outline" size={18} color="#FFF" />
        <Text style={styles.botaoPrimarioTexto}>Gerenciar assinatura</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: cores.fundo,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marca: { fontSize: 20, fontWeight: '600', color: cores.secundaria },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  ola: { fontSize: 30, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 15, color: cores.textoSecundario, marginTop: 4, lineHeight: 22 },

  cardPlano: { backgroundColor: cores.superficie, borderRadius: 32, padding: 26, marginTop: 24, ...sombra },
  cardPlanoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pill: { backgroundColor: cores.secundariaClara, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, flexShrink: 1 },
  pillTexto: { fontSize: 13, fontWeight: '600', color: '#483C88' },
  pontoRoxo: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#7B70C4' },
  renova: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  renovaTexto: { fontSize: 13, color: cores.textoSecundario, fontWeight: '500' },
  cardPlanoTitulo: { fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: 8 },
  cardPlanoTexto: { fontSize: 15, color: cores.textoSecundario, lineHeight: 24 },
  negrito: { fontWeight: '700', color: cores.texto },
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficieBaixa,
    padding: 12,
    marginTop: 18,
  },
  faixaTexto: { fontSize: 14, color: cores.texto },
  botaoPrimario: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    height: 58,
    marginTop: 24,
  },
  botaoPrimarioTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  saldoRotulo: { fontSize: 12, letterSpacing: 0.8, color: cores.textoSecundario, fontWeight: '500' },
  saldoLinha: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6, marginBottom: 8 },
  saldoNumero: { fontSize: 32, fontWeight: '700', color: cores.primaria },
  saldoTexto: { fontSize: 19, fontWeight: '600', color: cores.texto },
  saldoTotal: { fontSize: 12, color: cores.textoSecundario },
  progressoBox: { backgroundColor: cores.superficieBaixa, padding: 14, marginTop: 18 },
  progressoTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressoLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressoTexto: { fontSize: 13, color: cores.texto },
  progressoPercentual: { fontSize: 13, color: cores.primaria, fontWeight: '600' },
  trilha: { flexDirection: 'row', height: 8, gap: 4 },
  trilhaUsada: { backgroundColor: '#C6C5D2', borderRadius: 4 },
  trilhaRestante: { backgroundColor: cores.secundaria, borderRadius: 4 },

  secaoHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 32 },
  secaoTitulo: { fontSize: 21, fontWeight: '600', color: cores.texto },
  secaoSub: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  secaoContador: { fontSize: 14, color: cores.primaria, fontWeight: '600' },
  categoriasScroll: { marginHorizontal: -24, marginTop: 14, marginBottom: 30 },
  categorias: { paddingHorizontal: 24, gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  chipDestaque: { backgroundColor: cores.secundariaClara },
  chipTexto: { fontSize: 15, color: cores.texto, fontWeight: '500' },
});
