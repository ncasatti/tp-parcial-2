import { Op } from 'sequelize';
import { Proyecto, Tarea, HistorialTarea, Usuario, sequelize } from '../models/index.js';

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const ESTADOS_TAREA = ['pendiente', 'en_progreso', 'bloqueada', 'finalizada', 'cancelada'];
const ESTADOS_TERMINALES = ['finalizada', 'cancelada'];

const TRANSICIONES = {
  pendiente: ['en_progreso'],
  en_progreso: ['bloqueada', 'finalizada'],
  bloqueada: [],
  finalizada: [],
  cancelada: [],
};

class TareaService {
  static async listar(filtros, usuario) {
    const { proyectoId, responsableId, estado, prioridad, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = filtros;

    const where = {};
    if (proyectoId) where.proyectoId = proyectoId;
    if (responsableId) where.responsableId = responsableId;
    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;

    if (usuario && usuario.rol === 'colaborador') {
      where.responsableId = usuario.id;
    }

    const offset = (page - 1) * limit;

    const { rows: tareas, count } = await Tarea.findAndCountAll({
      where,
      include: [
        { association: 'proyecto', attributes: ['id', 'codigo', 'nombre', 'estado'] },
        { association: 'responsable', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      tareas,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async obtenerPorId(id) {
    const tarea = await Tarea.findByPk(id, {
      include: [
        { association: 'proyecto', attributes: ['id', 'codigo', 'nombre', 'estado'] },
        { association: 'responsable', attributes: ['id', 'nombre', 'email'] },
        { association: 'historial', include: [{ association: 'usuario', attributes: ['id', 'nombre'] }], order: [['fechaHora', 'DESC']] },
      ],
    });

    if (!tarea) return null;

    const vencida = this.calcularVencida(tarea);
    return { ...tarea.toJSON(), vencida };
  }

  static async crear(data, usuarioId) {
    const { proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite } = data;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      throw Object.assign(new Error('El proyecto no existe'), { status: 404 });
    }
    if (proyecto.estado === 'finalizado') {
      throw Object.assign(new Error('No se pueden crear tareas en un proyecto finalizado'), { status: 400 });
    }
    if (proyecto.estado === 'pausado') {
      throw Object.assign(new Error('No se pueden crear tareas en un proyecto pausado'), { status: 400 });
    }

    if (!proyecto.integrantes.includes(responsableId)) {
      throw Object.assign(new Error('El responsable no pertenece al proyecto'), { status: 400 });
    }

    if (!PRIORIDADES.includes(prioridad)) {
      throw Object.assign(new Error(`Prioridad inválida. Valores permitidos: ${PRIORIDADES.join(', ')}`), { status: 400 });
    }

    if (estado && !ESTADOS_TAREA.includes(estado)) {
      throw Object.assign(new Error(`Estado inválido. Valores permitidos: ${ESTADOS_TAREA.join(', ')}`), { status: 400 });
    }

    if (estado && ESTADOS_TERMINALES.includes(estado)) {
      throw Object.assign(new Error('No se puede crear una tarea en estado finalizado o cancelado'), { status: 400 });
    }

    const ahora = new Date();
    const tarea = await Tarea.create({
      proyectoId,
      titulo,
      descripcion,
      responsableId,
      prioridad,
      estado: estado || 'pendiente',
      fechaLimite,
      createdAt: ahora,
    });

    await HistorialTarea.create({
      tareaId: tarea.id,
      usuarioId,
      accion: 'creacion',
      fechaHora: ahora,
      valorAnterior: null,
      valorNuevo: { estado: tarea.estado, prioridad: tarea.prioridad, responsableId },
    });

    return this.obtenerPorId(tarea.id);
  }

  static async editar(id, data, usuarioId, rol) {
    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    }

    if (rol === 'colaborador' && tarea.responsableId !== usuarioId) {
      throw Object.assign(new Error('No tiene permisos para editar esta tarea'), { status: 403 });
    }

    if (ESTADOS_TERMINALES.includes(tarea.estado)) {
      throw Object.assign(new Error('No se puede editar una tarea finalizada o cancelada'), { status: 400 });
    }

    const proyecto = await Proyecto.findByPk(tarea.proyectoId);
    if (!proyecto) {
      throw Object.assign(new Error('El proyecto asociado no existe'), { status: 404 });
    }
    if (proyecto.estado === 'finalizado') {
      throw Object.assign(new Error('No se pueden editar tareas de un proyecto finalizado'), { status: 400 });
    }

    const cambios = {};
    const valorAnterior = {};

    if (data.titulo !== undefined) { cambios.titulo = data.titulo; valorAnterior.titulo = tarea.titulo; }
    if (data.descripcion !== undefined) { cambios.descripcion = data.descripcion; valorAnterior.descripcion = tarea.descripcion; }
    if (data.prioridad !== undefined) {
      if (!PRIORIDADES.includes(data.prioridad)) {
        throw Object.assign(new Error(`Prioridad inválida. Valores permitidos: ${PRIORIDADES.join(', ')}`), { status: 400 });
      }
      cambios.prioridad = data.prioridad;
      valorAnterior.prioridad = tarea.prioridad;
    }
    if (data.responsableId !== undefined) {
      if (!proyecto.integrantes.includes(data.responsableId)) {
        throw Object.assign(new Error('El responsable no pertenece al proyecto'), { status: 400 });
      }
      cambios.responsableId = data.responsableId;
      valorAnterior.responsableId = tarea.responsableId;
    }
    if (data.fechaLimite !== undefined) { cambios.fechaLimite = data.fechaLimite; valorAnterior.fechaLimite = tarea.fechaLimite; }

    if (Object.keys(cambios).length === 0) {
      throw Object.assign(new Error('No hay campos para editar'), { status: 400 });
    }

    await tarea.update(cambios);

    const accion = cambios.responsableId ? 'reasignacion' : 'edicion';
    await HistorialTarea.create({
      tareaId: id,
      usuarioId,
      accion,
      fechaHora: new Date(),
      valorAnterior,
      valorNuevo: cambios,
    });

    return this.obtenerPorId(id);
  }

  static async cambiarEstado(id, nuevoEstado, usuarioId, accion, rol) {
    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    }

    if (rol === 'colaborador' && tarea.responsableId !== usuarioId) {
      throw Object.assign(new Error('No tiene permisos para cambiar el estado de esta tarea'), { status: 403 });
    }

    if (ESTADOS_TERMINALES.includes(tarea.estado)) {
      throw Object.assign(new Error('No se puede cambiar el estado de una tarea finalizada o cancelada'), { status: 400 });
    }

    if (!TRANSICIONES[tarea.estado] || !TRANSICIONES[tarea.estado].includes(nuevoEstado)) {
      throw Object.assign(
        new Error(`Transición de estado no permitida: ${tarea.estado} → ${nuevoEstado}`),
        { status: 400 }
      );
    }

    const valorAnterior = { estado: tarea.estado };
    await tarea.update({ estado: nuevoEstado });

    await HistorialTarea.create({
      tareaId: id,
      usuarioId,
      accion: accion || 'cambio_estado',
      fechaHora: new Date(),
      valorAnterior,
      valorNuevo: { estado: nuevoEstado },
    });

    return this.obtenerPorId(id);
  }

  static async cancelar(id, usuarioId) {
    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    }

    if (ESTADOS_TERMINALES.includes(tarea.estado)) {
      throw Object.assign(new Error('La tarea ya está finalizada o cancelada'), { status: 400 });
    }

    const valorAnterior = { estado: tarea.estado };
    await tarea.update({ estado: 'cancelada' });

    await HistorialTarea.create({
      tareaId: id,
      usuarioId,
      accion: 'cancelacion',
      fechaHora: new Date(),
      valorAnterior,
      valorNuevo: { estado: 'cancelada' },
    });

    return this.obtenerPorId(id);
  }

  static async obtenerHistorial(tareaId) {
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    }

    return HistorialTarea.findAll({
      where: { tareaId },
      include: [{ association: 'usuario', attributes: ['id', 'nombre'] }],
      order: [['fechaHora', 'DESC']],
    });
  }

  static async resumen() {
    const total = await Tarea.count();

    const porEstado = await Tarea.findAll({
      attributes: ['estado', [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
      group: ['estado'],
      raw: true,
    });

    const ahora = new Date();
    const vencidas = await Tarea.count({
      where: {
        fechaLimite: { [Op.lt]: ahora },
        estado: { [Op.notIn]: ESTADOS_TERMINALES },
      },
    });

    const porResponsable = await Tarea.findAll({
      attributes: ['responsableId', [sequelize.fn('COUNT', sequelize.col('Tarea.id')), 'cantidad']],
      include: [{ association: 'responsable', attributes: ['nombre'] }],
      group: ['responsableId', 'responsable.id', 'responsable.nombre'],
    });

    const criticas = await Tarea.count({
      where: { prioridad: 'critica', estado: { [Op.notIn]: ESTADOS_TERMINALES } },
    });

    return { total, porEstado, vencidas, porResponsable, criticas };
  }

  static calcularVencida(tarea) {
    if (ESTADOS_TERMINALES.includes(tarea.estado)) return false;
    if (!tarea.fechaLimite) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(tarea.fechaLimite);
    return limite < hoy;
  }
}

export default TareaService;
