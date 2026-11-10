import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const savedUrl = await AsyncStorage.getItem('@api_base_url');
    if (savedUrl) {
      config.baseURL = savedUrl;
    }
  } catch (error) {
    console.warn('Erro ao ler baseURL do AsyncStorage:', error);
  }
  return config;
});

export const getUsuarioLogadoId = async () => {
  const id = await AsyncStorage.getItem('@usuario_logado_id');
  return id ? Number(id) : null;
};

// O backend responde erros como { mensagem }, { erro } ou um mapa campo -> mensagem
export const extrairMensagemErro = (error, padrao = 'Não foi possível concluir a operação.') => {
  const data = error?.response?.data;
  if (!data) return error?.response ? padrao : 'Falha ao conectar ao servidor.';
  if (typeof data === 'string') return data;
  if (data.mensagem || data.erro || data.message) return data.mensagem || data.erro || data.message;
  const primeiro = Object.values(data)[0];
  return typeof primeiro === 'string' ? primeiro : padrao;
};

export const buscarUsuario = async (usuarioId) => {
  const response = await api.get(`/usuarios/${usuarioId}`);
  return response.data;
};

export const listarPlanos = async () => {
  const response = await api.get('/assinaturas/planos');
  return response.data;
};

export const buscarResumoAssinatura = async (usuarioId) => {
  const response = await api.get(`/assinaturas/usuario/${usuarioId}`);
  return response.data;
};

export const listarAulas = async (filtros = {}) => {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
  );
  const response = await api.get('/aulas', { params });
  return response.data;
};

export const listarCategorias = async () => {
  const response = await api.get('/aulas/categorias');
  return response.data;
};

export const buscarAula = async (aulaId, usuarioId) => {
  const response = await api.get(`/aulas/${aulaId}`, { params: { usuarioId } });
  return response.data;
};

export const listarHorarios = async (aulaId) => {
  const response = await api.get(`/aulas/${aulaId}/horarios`);
  return response.data;
};

export const agendarAula = async (usuarioId, horarioId) => {
  const response = await api.post('/agendamentos', { usuarioId, horarioId });
  return response.data;
};

// tipo: 'proximas' | 'concluidas'
export const listarAgendamentos = async (usuarioId, tipo) => {
  const response = await api.get(`/agendamentos/usuario/${usuarioId}`, { params: { tipo } });
  return response.data;
};

export const reagendarAula = async (agendamentoId, usuarioId, novoHorarioId) => {
  const response = await api.put(`/agendamentos/${agendamentoId}/reagendar`, { usuarioId, novoHorarioId });
  return response.data;
};

export const cancelarAgendamento = async (agendamentoId, usuarioId) => {
  const response = await api.patch(`/agendamentos/${agendamentoId}/cancelar`, null, { params: { usuarioId } });
  return response.data;
};

export const solicitarCodigoRecuperacao = async (email) => {
  const response = await api.post('/usuarios/esqueci-senha', { email });
  return response.data;
};

export const redefinirSenha = async (email, codigo, novaSenha) => {
  const response = await api.post('/usuarios/redefinir-senha', {
    email,
    codigo,
    novaSenha,
  });
  return response.data;
};

export default api;