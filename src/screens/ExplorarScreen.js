import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AulaCard from '../components/AulaCard';
import { Erro, Vazio } from '../components/EstadoTela';
import { cores } from '../theme';
import { getUsuarioLogadoId, listarAulas, listarCategorias, extrairMensagemErro } from '../services/api';

export default function ExplorarScreen({ navigation, route }) {
  const [usuarioId, setUsuarioId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [categoriaId, setCategoriaId] = useState(route.params?.categoriaId ?? null);
  const [somenteInclusas, setSomenteInclusas] = useState(false);
  const [cidade, setCidade] = useState(null);
  const [seletorCidadeAberto, setSeletorCidadeAberto] = useState(false);

  const [aulas, setAulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Dados fixos da tela: usuário, categorias e cidades com aulas
  useEffect(() => {
    getUsuarioLogadoId().then((id) => setUsuarioId(id ?? 0));
    (async () => {
      try {
        const [listaCategorias, todasAulas] = await Promise.all([listarCategorias(), listarAulas()]);
        setCategorias(listaCategorias);
        const unicas = new Map();
        todasAulas.forEach((a) => unicas.set(a.cidade, `${a.cidade}, ${a.estado}`));
        setCidades([...unicas.entries()].map(([nome, rotulo]) => ({ nome, rotulo })));
      } catch {
        // Sem categorias/cidades os filtros ficam vazios, mas a lista de aulas ainda funciona
      }
    })();
  }, []);

  // A Home abre o Explorar já filtrado por uma categoria
  useEffect(() => {
    if (route.params?.categoriaId !== undefined) {
      setCategoriaId(route.params.categoriaId);
      setSomenteInclusas(false);
      navigation.setParams({ categoriaId: undefined });
    }
  }, [route.params?.categoriaId, navigation]);

  // Espera o usuário parar de digitar antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => setBuscaAplicada(busca.trim()), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const buscarAulas = useCallback(async () => {
    if (usuarioId === null) return;
    try {
      setCarregando(true);
      setErro(null);
      const resultado = await listarAulas({
        usuarioId: usuarioId || undefined,
        categoriaId,
        busca: buscaAplicada,
        cidade,
        inclusoNoPlano: somenteInclusas || undefined,
      });
      setAulas(resultado);
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Não foi possível carregar as aulas.'));
    } finally {
      setCarregando(false);
    }
  }, [usuarioId, categoriaId, buscaAplicada, cidade, somenteInclusas]);

  useEffect(() => {
    buscarAulas();
  }, [buscarAulas]);

  const todasAtivas = !categoriaId && !somenteInclusas;
  const rotuloCidade = cidades.find((c) => c.nome === cidade)?.rotulo || 'Todas as cidades';

  const cabecalho = (
    <>
      <View style={styles.tituloLinha}>
        <Text style={styles.titulo}>Explorar Aulas</Text>
        <TouchableOpacity style={styles.cidade} onPress={() => setSeletorCidadeAberto(true)}>
          <Ionicons name="location-outline" size={16} color={cores.primaria} />
          <Text style={styles.cidadeTexto} numberOfLines={1}>{rotuloCidade}</Text>
          <Ionicons name="chevron-down" size={14} color={cores.texto} />
        </TouchableOpacity>
      </View>

      <View style={styles.busca}>
        <Ionicons name="search" size={20} color={cores.textoSecundario} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por aula, hobby ou ateliê..."
          placeholderTextColor={cores.textoSuave}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
          autoCorrect={false}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={cores.textoSuave} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        <Chip
          ativo={todasAtivas}
          icone={<Ionicons name="sparkles-outline" size={18} color={todasAtivas ? '#FFF' : cores.primaria} />}
          texto="Todas"
          onPress={() => {
            setCategoriaId(null);
            setSomenteInclusas(false);
          }}
        />
        <Chip
          ativo={somenteInclusas}
          icone={<Ionicons name="checkmark-circle" size={18} color={somenteInclusas ? '#FFF' : cores.primaria} />}
          texto="Incluso no plano"
          onPress={() => setSomenteInclusas((v) => !v)}
        />
        {categorias.map((c) => {
          const ativo = categoriaId === c.id;
          return (
            <Chip
              key={c.id}
              ativo={ativo}
              icone={<MaterialCommunityIcons name={c.icone || 'palette-outline'} size={18} color={ativo ? '#FFF' : cores.primaria} />}
              texto={c.nome}
              onPress={() => setCategoriaId(ativo ? null : c.id)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.resultadoLinha}>
        <Text style={styles.secaoTitulo}>Oficinas em Destaque</Text>
        {!carregando && (
          <Text style={styles.contador}>
            {aulas.length} {aulas.length === 1 ? 'encontrada' : 'encontradas'}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topo}>
        <View style={styles.logo}>
          <Ionicons name="color-palette-outline" size={20} color={cores.secundaria} />
        </View>
        <Text style={styles.marca}>HobbyHub</Text>
      </View>

      <FlatList
        data={carregando || erro ? [] : aulas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={cabecalho}
        renderItem={({ item }) => (
          <AulaCard aula={item} onPress={() => navigation.navigate('DetalhesAula', { aulaId: item.id })} />
        )}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 40 }} />
          ) : erro ? (
            <Erro mensagem={erro} onTentarNovamente={buscarAulas} />
          ) : (
            <Vazio
              icone="search-outline"
              titulo="Nenhuma aula encontrada"
              descricao="Tente outra busca ou remova alguns filtros."
            />
          )
        }
      />

      <Modal visible={seletorCidadeAberto} transparent animationType="fade" onRequestClose={() => setSeletorCidadeAberto(false)}>
        <Pressable style={styles.overlay} onPress={() => setSeletorCidadeAberto(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Escolha a cidade</Text>
            {[{ nome: null, rotulo: 'Todas as cidades' }, ...cidades].map((opcao) => {
              const ativa = opcao.nome === cidade;
              return (
                <TouchableOpacity
                  key={opcao.rotulo}
                  style={styles.modalOpcao}
                  onPress={() => {
                    setCidade(opcao.nome);
                    setSeletorCidadeAberto(false);
                  }}
                >
                  <Text style={[styles.modalOpcaoTexto, ativa && { color: cores.primaria, fontWeight: '700' }]}>
                    {opcao.rotulo}
                  </Text>
                  {ativa && <Ionicons name="checkmark" size={18} color={cores.primaria} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Chip({ ativo, icone, texto, onPress }) {
  return (
    <TouchableOpacity style={[styles.chip, ativo && styles.chipAtivo]} onPress={onPress} activeOpacity={0.85}>
      {icone}
      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 10 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.secundariaClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marca: { fontSize: 20, fontWeight: '600', color: cores.secundaria },
  lista: { paddingHorizontal: 24, paddingBottom: 32 },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  titulo: { fontSize: 28, fontWeight: '700', color: cores.texto },
  cidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.superficieMedia,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 1,
  },
  cidadeTexto: { fontSize: 14, fontWeight: '500', color: cores.texto, flexShrink: 1 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    paddingHorizontal: 20,
    height: 56,
    marginTop: 16,
  },
  buscaInput: { flex: 1, fontSize: 15, color: cores.texto },
  chipsScroll: { marginHorizontal: -24, marginTop: 20 },
  chips: { paddingHorizontal: 24, gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  chipAtivo: { backgroundColor: cores.secundaria },
  chipTexto: { fontSize: 15, color: cores.texto, fontWeight: '500' },
  chipTextoAtivo: { color: '#FFF', fontWeight: '600' },
  resultadoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 16,
  },
  secaoTitulo: { fontSize: 21, fontWeight: '600', color: cores.texto },
  contador: { fontSize: 13, color: cores.textoSecundario },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 32 },
  modal: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20 },
  modalTitulo: { fontSize: 18, fontWeight: '700', color: cores.texto, marginBottom: 8 },
  modalOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  modalOpcaoTexto: { fontSize: 16, color: cores.texto },
});
