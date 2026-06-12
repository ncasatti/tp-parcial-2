// Acá juntamos todos los modelos en un solo lugar.
// Cuando agreguemos Proyecto, Tarea e HistorialTarea, las asociaciones
// (hasMany / belongsTo) van a ir definidas en este archivo.
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

// TODO: asociaciones entre modelos cuando existan los demás

export { sequelize, Usuario };
