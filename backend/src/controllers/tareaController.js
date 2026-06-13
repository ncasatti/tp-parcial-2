import TareaService from '../services/tareaService.js';

const tareaController = {
  async listar(req, res, next) {
    try {
      const resultado = await TareaService.listar(req.query, req.usuario);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async obtenerPorId(req, res, next) {
    try {
      const tarea = await TareaService.obtenerPorId(req.params.id);
      if (!tarea) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json(tarea);
    } catch (error) {
      next(error);
    }
  },

  async crear(req, res, next) {
    try {
      const tarea = await TareaService.crear(req.body, req.usuario.id);
      res.status(201).json(tarea);
    } catch (error) {
      next(error);
    }
  },

  async editar(req, res, next) {
    try {
      const tarea = await TareaService.editar(req.params.id, req.body, req.usuario.id, req.usuario.rol);
      res.json(tarea);
    } catch (error) {
      next(error);
    }
  },

  async cambiarEstado(req, res, next) {
    try {
      const { estado, accion } = req.body;
      const tarea = await TareaService.cambiarEstado(req.params.id, estado, req.usuario.id, accion, req.usuario.rol);
      res.json(tarea);
    } catch (error) {
      next(error);
    }
  },

  async cancelar(req, res, next) {
    try {
      const tarea = await TareaService.cancelar(req.params.id, req.usuario.id);
      res.json(tarea);
    } catch (error) {
      next(error);
    }
  },

  async historial(req, res, next) {
    try {
      const historial = await TareaService.obtenerHistorial(req.params.id);
      res.json(historial);
    } catch (error) {
      next(error);
    }
  },

  async resumen(req, res, next) {
    try {
      const datos = await TareaService.resumen();
      res.json(datos);
    } catch (error) {
      next(error);
    }
  },
};

export default tareaController;
