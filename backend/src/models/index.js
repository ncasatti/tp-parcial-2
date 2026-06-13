import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Proyecto from './Proyecto.js';
import Tarea from './Tarea.js';
import HistorialTarea from './HistorialTarea.js';

Proyecto.hasMany(Tarea, { foreignKey: 'proyectoId', as: 'tareas' });
Tarea.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });

Usuario.hasMany(Tarea, { foreignKey: 'responsableId', as: 'tareasAsignadas' });
Tarea.belongsTo(Usuario, { foreignKey: 'responsableId', as: 'responsable' });

Tarea.hasMany(HistorialTarea, { foreignKey: 'tareaId', as: 'historial' });
HistorialTarea.belongsTo(Tarea, { foreignKey: 'tareaId', as: 'tarea' });

Usuario.hasMany(HistorialTarea, { foreignKey: 'usuarioId', as: 'accionesHistorial' });
HistorialTarea.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

export { sequelize, Usuario, Proyecto, Tarea, HistorialTarea };
