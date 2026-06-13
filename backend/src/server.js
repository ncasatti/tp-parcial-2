// Punto de entrada del backend: conecta la base y levanta el servidor.
import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate(); // probamos que la conexión funcione
    await sequelize.sync(); // crea las tablas si todavía no existen
    console.log('Base de datos conectada');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
  }
}

iniciar();
