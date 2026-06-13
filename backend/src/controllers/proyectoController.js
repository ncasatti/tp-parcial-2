import { Proyecto } from '../models/index.js';

const proyectoController = {
  async listar(req, res, next) {
    try {
      const proyectos = await Proyecto.findAll();
      res.json(proyectos);
    } catch (error) {
      next(error);
    }
  },
};

export default proyectoController;
