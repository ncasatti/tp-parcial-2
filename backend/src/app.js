// Configuración de Express: middlewares y rutas.
// Separamos app.js (configura) de server.js (arranca) para poder testear con Supertest.
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import tareasRoutes from './routes/tareas.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/proyectos', proyectosRoutes);

app.use(errorHandler);

export default app;
