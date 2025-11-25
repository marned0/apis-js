/**
 * Configuración de Express
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupSwagger } = require('../swagger/swagger');

/**
 * Crea y configura la aplicación Express
 * @returns {express.Application}
 */
const createApp = () => {
  const app = express();

  // Seguridad con Helmet - CSP configurado para Swagger UI
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Rate limiting para protección contra ataques de denegación de servicio
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana por IP
    message: {
      error: true,
      mensaje: 'Demasiadas peticiones desde esta IP. Por favor, inténtelo de nuevo después de 15 minutos.',
      errores: [],
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
  });

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

  // Rutas de la API con rate limiting
  app.use('/api', apiLimiter, apiRoutes);

  // Manejo de rutas no encontradas
  app.use(notFoundHandler);

  // Manejo de errores global
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
