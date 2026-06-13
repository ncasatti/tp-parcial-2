import api from './api.js';

export async function listarProyectos() {
  const { data } = await api.get('/proyectos');
  return data;
}
