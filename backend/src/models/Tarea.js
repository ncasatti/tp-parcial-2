import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Tarea extends Model {}

Tarea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    proyectoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    responsableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'bloqueada', 'finalizada', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    fechaLimite: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Tarea',
    tableName: 'tareas',
    updatedAt: false,
  }
);

export default Tarea;
