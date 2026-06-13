import { Router } from 'express';
import proyectoController from '../controllers/proyectoController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, proyectoController.listar);

export default router;
