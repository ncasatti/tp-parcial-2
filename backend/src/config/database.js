// Acá creamos la conexión a la base con Sequelize.
// Usamos SQLite, que guarda todo en un solo archivo (database.sqlite).
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';

const isTest = process.env.NODE_ENV === 'test';
const storage = process.env.DB_STORAGE || (isTest ? ':memory:' : '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: !isTest && false,
});

export default sequelize;
