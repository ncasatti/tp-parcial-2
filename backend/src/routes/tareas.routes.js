import { Router } from 'express';
import tareaController from '../controllers/tareaController.js';
import { authMiddleware } from '../middlewares/auth.js';
import authorize from '../middlewares/autorizacion.js';

const router = Router();

router.get('/resumen', authMiddleware, authorize('admin', 'lider'), tareaController.resumen);
router.get('/:id/historial', authMiddleware, tareaController.historial);
router.get('/:id', authMiddleware, tareaController.obtenerPorId);
router.get('/', authMiddleware, tareaController.listar);
router.post('/', authMiddleware, authorize('admin', 'lider'), tareaController.crear);
router.put('/:id', authMiddleware, tareaController.editar);
router.patch('/:id/iniciar', authMiddleware, (req, res, next) => { req.body = { estado: 'en_progreso', accion: 'cambio_estado' }; next(); }, tareaController.cambiarEstado);
router.patch('/:id/bloquear', authMiddleware, (req, res, next) => { req.body = { estado: 'bloqueada', accion: 'cambio_estado' }; next(); }, tareaController.cambiarEstado);
router.patch('/:id/finalizar', authMiddleware, authorize('admin', 'lider'), (req, res, next) => { req.body = { estado: 'finalizada', accion: 'cambio_estado' }; next(); }, tareaController.cambiarEstado);
router.patch('/:id/cancelar', authMiddleware, authorize('admin', 'lider'), tareaController.cancelar);

export default router;
