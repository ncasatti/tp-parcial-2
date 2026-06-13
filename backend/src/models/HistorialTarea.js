import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class HistorialTarea extends Model {}

HistorialTarea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accion: {
      type: DataTypes.ENUM('creacion', 'edicion', 'reasignacion', 'cambio_estado', 'cancelacion'),
      allowNull: false,
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valorAnterior: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('valorAnterior');
        return raw ? JSON.parse(raw) : null;
      },
      set(value) {
        this.setDataValue('valorAnterior', value ? JSON.stringify(value) : null);
      },
    },
    valorNuevo: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('valorNuevo');
        return raw ? JSON.parse(raw) : null;
      },
      set(value) {
        this.setDataValue('valorNuevo', value ? JSON.stringify(value) : null);
      },
    },
  },
  {
    sequelize,
    modelName: 'HistorialTarea',
    tableName: 'historial_tareas',
    timestamps: false,
  }
);

export default HistorialTarea;
