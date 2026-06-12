// Configuración de Express: middlewares y rutas.
// Separamos app.js (configura) de server.js (arranca) para poder testear con Supertest.
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(cors()); // permite peticiones desde el frontend
app.use(express.json()); // para leer el body en JSON

// montamos las rutas bajo /api
app.use('/api', healthRoutes);

export default app;
