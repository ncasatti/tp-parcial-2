import 'dotenv/config';
import { sequelize, Usuario, Proyecto, Tarea, HistorialTarea } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app.js';
import { JWT_SECRET } from '../src/middlewares/auth.js';

let tokenAdmin;
let tokenLider;
let tokenColab;
let tareaId;
const hash = await bcrypt.hash('1234', 10);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });

  await Usuario.bulkCreate([
    { id: 1, nombre: 'Admin', email: 'admin@test.com', passwordHash: hash, rol: 'admin', activo: true },
    { id: 2, nombre: 'Lider', email: 'lider@test.com', passwordHash: hash, rol: 'lider', activo: true },
    { id: 3, nombre: 'Colaborador1', email: 'colab1@test.com', passwordHash: hash, rol: 'colaborador', activo: true },
    { id: 4, nombre: 'Colaborador2', email: 'colab2@test.com', passwordHash: hash, rol: 'colaborador', activo: true },
  ]);

  await Proyecto.bulkCreate([
    { id: 1, codigo: 'TEST-01', nombre: 'Proyecto Activo', descripcion: 'Test', estado: 'activo', integrantes: [1, 2, 3] },
    { id: 2, codigo: 'TEST-02', nombre: 'Proyecto Finalizado', descripcion: 'Test', estado: 'finalizado', integrantes: [1, 2] },
    { id: 3, codigo: 'TEST-03', nombre: 'Proyecto Pausado', descripcion: 'Test', estado: 'pausado', integrantes: [2, 4] },
  ]);

  const maniana = new Date(); maniana.setDate(maniana.getDate() + 1);

  await Tarea.bulkCreate([
    { id: 1, proyectoId: 1, titulo: 'Tarea pendiente', descripcion: 'Desc', responsableId: 3, prioridad: 'alta', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
    { id: 2, proyectoId: 1, titulo: 'Tarea en progreso', descripcion: 'Desc', responsableId: 3, prioridad: 'media', estado: 'en_progreso', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
    { id: 3, proyectoId: 1, titulo: 'Tarea finalizada', descripcion: 'Desc', responsableId: 2, prioridad: 'baja', estado: 'finalizada', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
    { id: 4, proyectoId: 1, titulo: 'Tarea cancelada', descripcion: 'Desc', responsableId: 2, prioridad: 'critica', estado: 'cancelada', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
    { id: 5, proyectoId: 1, titulo: 'Tarea bloqueada', descripcion: 'Desc', responsableId: 3, prioridad: 'alta', estado: 'bloqueada', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
    { id: 6, proyectoId: 1, titulo: 'Tarea del lider', descripcion: 'Desc', responsableId: 2, prioridad: 'media', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: new Date() },
  ]);

  tokenAdmin = jwt.sign({ id: 1, nombre: 'Admin', email: 'admin@test.com', rol: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
  tokenLider = jwt.sign({ id: 2, nombre: 'Lider', email: 'lider@test.com', rol: 'lider' }, JWT_SECRET, { expiresIn: '1h' });
  tokenColab = jwt.sign({ id: 3, nombre: 'Colab1', email: 'colab1@test.com', rol: 'colaborador' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/login', () => {
  test('login correcto devuelve token y usuario', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: '1234' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('admin@test.com');
    expect(res.body.usuario.rol).toBe('admin');
  });

  test('login invalido devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Credenciales');
  });
});

describe('GET /api/tareas', () => {
  test('sin token devuelve 401', async () => {
    const res = await request(app).get('/api/tareas');
    expect(res.status).toBe(401);
  });

  test('listar tareas con filtros', async () => {
    const res = await request(app).get('/api/tareas?estado=pendiente').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.tareas.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tareas.every((t) => t.estado === 'pendiente')).toBe(true);
  });

  test('listar tareas paginado', async () => {
    const res = await request(app).get('/api/tareas?page=1&limit=2').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.tareas.length).toBeLessThanOrEqual(2);
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('total');
  });
});

describe('GET /api/tareas/:id', () => {
  test('detalle de tarea existente', async () => {
    const res = await request(app).get('/api/tareas/1').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Tarea pendiente');
    expect(res.body).toHaveProperty('vencida');
    expect(res.body).toHaveProperty('historial');
  });

  test('detalle de tarea inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/tareas/999').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/tareas', () => {
  test('creacion valida por admin', async () => {
    const res = await request(app).post('/api/tareas').set('Authorization', `Bearer ${tokenAdmin}`).send({
      proyectoId: 1, titulo: 'Nueva tarea test', descripcion: 'Descripción test',
      responsableId: 3, prioridad: 'alta', fechaLimite: '2026-12-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Nueva tarea test');
    tareaId = res.body.id;
  });

  test('creacion con responsable fuera del proyecto devuelve 400', async () => {
    const res = await request(app).post('/api/tareas').set('Authorization', `Bearer ${tokenAdmin}`).send({
      proyectoId: 1, titulo: 'Invalida', descripcion: 'Desc',
      responsableId: 4, prioridad: 'media', fechaLimite: '2026-12-31',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('responsable no pertenece');
  });

  test('creacion con prioridad invalida devuelve 400', async () => {
    const res = await request(app).post('/api/tareas').set('Authorization', `Bearer ${tokenAdmin}`).send({
      proyectoId: 1, titulo: 'Invalida', descripcion: 'Desc',
      responsableId: 3, prioridad: 'ultra', fechaLimite: '2026-12-31',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Prioridad inválida');
  });

  test('creacion en proyecto finalizado devuelve 400', async () => {
    const res = await request(app).post('/api/tareas').set('Authorization', `Bearer ${tokenAdmin}`).send({
      proyectoId: 2, titulo: 'Invalida', descripcion: 'Desc',
      responsableId: 1, prioridad: 'media', fechaLimite: '2026-12-31',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('proyecto finalizado');
  });

  test('colaborador no puede crear tareas', async () => {
    const res = await request(app).post('/api/tareas').set('Authorization', `Bearer ${tokenColab}`).send({
      proyectoId: 1, titulo: 'Invalida', descripcion: 'Desc',
      responsableId: 3, prioridad: 'media', fechaLimite: '2026-12-31',
    });
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/tareas/:id', () => {
  test('editar tarea propia como colaborador', async () => {
    const res = await request(app).put('/api/tareas/1').set('Authorization', `Bearer ${tokenColab}`).send({
      descripcion: 'Descripción actualizada',
    });
    expect(res.status).toBe(200);
    expect(res.body.descripcion).toBe('Descripción actualizada');
  });

  test('editar tarea ajena como colaborador devuelve 403', async () => {
    const res = await request(app).put('/api/tareas/6').set('Authorization', `Bearer ${tokenColab}`).send({
      descripcion: 'Intento ajeno',
    });
    expect(res.status).toBe(403);
  });

  test('colaborador puede editar su propia tarea', async () => {
    const res = await request(app).put('/api/tareas/2').set('Authorization', `Bearer ${tokenColab}`).send({
      descripcion: 'Actualización propia',
    });
    expect(res.status).toBe(200);
  });

  test('editar tarea finalizada devuelve 400', async () => {
    const res = await request(app).put('/api/tareas/3').set('Authorization', `Bearer ${tokenAdmin}`).send({
      descripcion: 'Intento',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('finalizada');
  });
});

describe('PATCH /api/tareas/:id/iniciar', () => {
  test('iniciar tarea pendiente como colaborador responsable', async () => {
    const res = await request(app).patch('/api/tareas/1/iniciar').set('Authorization', `Bearer ${tokenColab}`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('en_progreso');
  });

  test('transicion no permitida desde finalizada devuelve 400', async () => {
    const res = await request(app).patch('/api/tareas/3/finalizar').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tareas/:id/cancelar', () => {
  test('cancelar tarea como admin', async () => {
    const res = await request(app).patch('/api/tareas/5/cancelar').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelada');
  });

  test('colaborador no puede cancelar', async () => {
    const res = await request(app).patch('/api/tareas/2/cancelar').set('Authorization', `Bearer ${tokenColab}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/tareas/resumen', () => {
  test('resumen accesible por admin', async () => {
    const res = await request(app).get('/api/tareas/resumen').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('porEstado');
    expect(res.body).toHaveProperty('vencidas');
    expect(res.body).toHaveProperty('criticas');
  });

  test('colaborador no puede ver resumen', async () => {
    const res = await request(app).get('/api/tareas/resumen').set('Authorization', `Bearer ${tokenColab}`);
    expect(res.status).toBe(403);
  });
});
