// Rutas de healthcheck: sirven para chequear que la API está viva.
import { Router } from 'express';

const router = Router();

// GET /api/health -> responde ok si el server anda
router.get('/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API funcionando' });
});

export default router;
