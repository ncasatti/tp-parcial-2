// Acá creamos la conexión a la base con Sequelize.
// Usamos SQLite, que guarda todo en un solo archivo (database.sqlite).
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../../database.sqlite',
  logging: false, // false para no llenar la consola con cada query SQL
});

export default sequelize;
