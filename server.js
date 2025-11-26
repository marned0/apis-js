/**
 * Punto de entrada de la aplicación
 */

require('dotenv').config();

const createApp = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a MongoDB (opcional, la app funciona sin DB)
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.log('⚠️  MONGODB_URI no configurada. Los endpoints de direcciones no funcionarán.');
    }

    // Crear la aplicación
    const app = createApp();

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación Swagger en http://localhost:${PORT}/api-docs`);
      console.log(`💚 Health check en http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
