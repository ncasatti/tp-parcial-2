import api from './api.js';

export async function listarTareas(params = {}) {
  const { data } = await api.get('/tareas', { params });
  return data;
}

export async function obtenerTarea(id) {
  const { data } = await api.get(`/tareas/${id}`);
  return data;
}

export async function crearTarea(body) {
  const { data } = await api.post('/tareas', body);
  return data;
}

export async function editarTarea(id, body) {
  const { data } = await api.put(`/tareas/${id}`, body);
  return data;
}

export async function iniciarTarea(id) {
  const { data } = await api.patch(`/tareas/${id}/iniciar`);
  return data;
}

export async function bloquearTarea(id) {
  const { data } = await api.patch(`/tareas/${id}/bloquear`);
  return data;
}

export async function finalizarTarea(id) {
  const { data } = await api.patch(`/tareas/${id}/finalizar`);
  return data;
}

export async function cancelarTarea(id) {
  const { data } = await api.patch(`/tareas/${id}/cancelar`);
  return data;
}

export async function obtenerHistorial(id) {
  const { data } = await api.get(`/tareas/${id}/historial`);
  return data;
}

export async function obtenerResumen() {
  const { data } = await api.get('/tareas/resumen');
  return data;
}
