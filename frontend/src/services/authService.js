import api from './api.js';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(nombre, email, password, rol) {
  const { data } = await api.post('/auth/register', { nombre, email, password, rol });
  return data;
}
