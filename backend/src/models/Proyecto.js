import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Proyecto extends Model {}

Proyecto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('activo', 'pausado', 'finalizado'),
      allowNull: false,
      defaultValue: 'activo',
    },
    integrantes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('integrantes');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('integrantes', JSON.stringify(value));
      },
    },
  },
  {
    sequelize,
    modelName: 'Proyecto',
    tableName: 'proyectos',
  }
);

export default Proyecto;
