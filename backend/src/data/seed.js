import { sequelize, Usuario, Proyecto, Tarea, HistorialTarea } from '../models/index.js';
import bcrypt from 'bcrypt';

async function seed() {
  await sequelize.sync({ force: true });

  const hash = await bcrypt.hash('1234', 10);

  const usuarios = await Usuario.bulkCreate([
    { nombre: 'Mica Torres', email: 'mica@dds.com', passwordHash: hash, rol: 'admin', activo: true },
    { nombre: 'Facu Iri', email: 'facu@dds.com', passwordHash: hash, rol: 'lider', activo: true },
    { nombre: 'Lucas Gómez', email: 'lucas@dds.com', passwordHash: hash, rol: 'colaborador', activo: true },
    { nombre: 'Valentina Celiz', email: 'vale@dds.com', passwordHash: hash, rol: 'colaborador', activo: true },
    { nombre: 'Nico Casatti', email: 'nico@dds.com', passwordHash: hash, rol: 'colaborador', activo: true },
  ]);

  const proyectos = await Proyecto.bulkCreate([
    { codigo: 'DDS-API', nombre: 'Portal de alumnos', descripcion: 'Sistema interno de seguimiento académico', estado: 'activo', integrantes: [1, 2, 3, 4, 5] },
    { codigo: 'DDS-WEB', nombre: 'Sitio institucional', descripcion: 'Rediseño del sitio web de la facultad', estado: 'activo', integrantes: [1, 2, 3] },
    { codigo: 'DDS-MOVIL', nombre: 'App móvil', descripcion: 'Aplicación móvil para consulta de horarios', estado: 'pausado', integrantes: [1, 4, 5] },
    { codigo: 'DDS-LEGACY', nombre: 'Sistema legacy', descripcion: 'Migración de sistema antiguo a nueva plataforma', estado: 'finalizado', integrantes: [1, 2] },
  ]);

  const ahora = new Date();
  const ayer = new Date(ahora); ayer.setDate(ayer.getDate() - 1);
  const maniana = new Date(ahora); maniana.setDate(maniana.getDate() + 1);
  const pasado = new Date(ahora); pasado.setDate(pasado.getDate() - 5);

  const tareasData = [
    { proyectoId: 1, titulo: 'Implementar login', descripcion: 'Crear endpoint y pantalla de login', responsableId: 3, prioridad: 'alta', estado: 'en_progreso', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Diseñar base de datos', descripcion: 'Modelar entidades y relaciones', responsableId: 2, prioridad: 'critica', estado: 'finalizada', fechaLimite: ayer.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Configurar CI/CD', descripcion: 'Pipeline de integración continua', responsableId: 4, prioridad: 'media', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Documentar API', descripcion: 'Escribir documentación de endpoints', responsableId: 5, prioridad: 'baja', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Corregir bug en registro', descripcion: 'Error 500 al registrar usuario duplicado', responsableId: 3, prioridad: 'alta', estado: 'en_progreso', fechaLimite: ayer.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 2, titulo: 'Maqueta home', descripcion: 'Diseñar la página principal', responsableId: 3, prioridad: 'alta', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 2, titulo: 'Componente header', descripcion: 'Header responsivo con navegación', responsableId: 2, prioridad: 'media', estado: 'en_progreso', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 2, titulo: 'Footer accesible', descripcion: 'Footer con enlaces y accesibilidad', responsableId: 3, prioridad: 'baja', estado: 'bloqueada', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 3, titulo: 'Pantalla de login móvil', descripcion: 'Adaptar login a pantallas pequeñas', responsableId: 4, prioridad: 'alta', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 3, titulo: 'Notificaciones push', descripcion: 'Implementar servicio de notificaciones', responsableId: 5, prioridad: 'media', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 4, titulo: 'Exportar datos legacy', descripcion: 'Exportar datos del sistema antiguo', responsableId: 2, prioridad: 'critica', estado: 'finalizada', fechaLimite: ayer.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 4, titulo: 'Validar consistencia', descripcion: 'Chequear que los datos migrados sean correctos', responsableId: 1, prioridad: 'alta', estado: 'finalizada', fechaLimite: ayer.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Tests de autenticación', descripcion: 'Escribir tests para login y registro', responsableId: 2, prioridad: 'alta', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 1, titulo: 'Dashboard admin', descripcion: 'Panel de administración con resumen', responsableId: 1, prioridad: 'critica', estado: 'pendiente', fechaLimite: maniana.toISOString().split('T')[0], createdAt: pasado },
    { proyectoId: 2, titulo: 'Integrar API', descripcion: 'Conectar frontend con backend', responsableId: 2, prioridad: 'alta', estado: 'bloqueada', fechaLimite: ayer.toISOString().split('T')[0], createdAt: pasado },
  ];

  const tareas = await Tarea.bulkCreate(tareasData);

  await HistorialTarea.bulkCreate([
    { tareaId: 1, usuarioId: 1, accion: 'creacion', fechaHora: pasado, valorAnterior: null, valorNuevo: JSON.stringify({ estado: 'pendiente', prioridad: 'alta' }) },
    { tareaId: 1, usuarioId: 3, accion: 'cambio_estado', fechaHora: new Date(), valorAnterior: JSON.stringify({ estado: 'pendiente' }), valorNuevo: JSON.stringify({ estado: 'en_progreso' }) },
    { tareaId: 2, usuarioId: 1, accion: 'creacion', fechaHora: pasado, valorAnterior: null, valorNuevo: JSON.stringify({ estado: 'pendiente', prioridad: 'critica' }) },
    { tareaId: 2, usuarioId: 2, accion: 'cambio_estado', fechaHora: ayer, valorAnterior: JSON.stringify({ estado: 'pendiente' }), valorNuevo: JSON.stringify({ estado: 'en_progreso' }) },
    { tareaId: 2, usuarioId: 2, accion: 'cambio_estado', fechaHora: ayer, valorAnterior: JSON.stringify({ estado: 'en_progreso' }), valorNuevo: JSON.stringify({ estado: 'finalizada' }) },
  ]);

  console.log('Seed completado: 5 usuarios, 4 proyectos, 15 tareas, historial.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
