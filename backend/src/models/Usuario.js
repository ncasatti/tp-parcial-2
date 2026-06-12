// Modelo Usuario. Lo definimos con una CLASE que extiende de Model (forma de Sequelize).
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// extendemos Model; acá adentro después podemos sumar métodos propios del usuario
class Usuario extends Model {}

// init() le dice a Sequelize qué campos tiene la tabla
Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false, // obligatorio
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // no puede haber dos usuarios con el mismo email
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false, // guardamos el hash de bcrypt, nunca la contraseña en texto
    },
    rol: {
      // solo estos tres valores permitidos
      type: DataTypes.ENUM('colaborador', 'lider', 'admin'),
      allowNull: false,
      defaultValue: 'colaborador',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // sirve para bloquear un usuario sin borrarlo
    },
  },
  {
    sequelize, // le pasamos la conexión
    modelName: 'Usuario',
    tableName: 'usuarios', // nombre real de la tabla
  }
);

export default Usuario;
