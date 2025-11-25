/**
 * Configuración de Express
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupSwagger } = require('../swagger/swagger');

/**
 * Crea y configura la aplicación Express
 * @returns {express.Application}
 */
const createApp = () => {
  const app = express();

  // Seguridad con Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Desactivar para Swagger UI
    crossOriginEmbedderPolicy: false
  }));

  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Logging con Morgan
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Parseo de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Configurar Swagger
  setupSwagger(app);

  // Ruta de health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      nombre: 'API de Validaciones',
      version: '1.0.0',
      documentacion: '/api-docs',
      endpoints: {
        buscarPorCodigoPostal: 'POST /api/buscar-por-codigo-postal',
        buscarPorPoblacion: 'POST /api/buscar-por-poblacion',
        validarDocumento: 'POST /api/validar-documento',
        validarIban: 'POST /api/validar-iban',
        generarIban: 'POST /api/generar-iban',
        consultarSwift: 'POST /api/consultar-swift'
      }
    });
  });

  // Rutas de la API
  app.use('/api', apiRoutes);

  // Manejo de rutas no encontradas
  app.use(notFoundHandler);

  // Manejo de errores global
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
