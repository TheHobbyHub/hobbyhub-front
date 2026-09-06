import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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