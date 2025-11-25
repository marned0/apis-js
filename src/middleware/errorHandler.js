/**
 * Middleware para manejo global de errores
 */

/**
 * Formatea errores de validación a un formato consistente
 * @param {Array} errors - Errores de express-validator
 * @returns {Array} - Errores formateados
 */
const formatearErroresValidacion = (errors) => {
  return errors.map(error => ({
    campo: error.path || error.param,
    mensaje: error.msg
  }));
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: true,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    errores: [],
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para manejar errores de forma global
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(e => ({
      campo: e.path,
      mensaje: e.message
    }));

    return res.status(422).json({
      error: true,
      mensaje: 'Error de validación',
      errores,
      timestamp: new Date().toISOString()
    });
  }

  // Error de cast de Mongoose (ID inválido, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: true,
      mensaje: `Valor inválido para el campo ${err.path}`,
      errores: [{ campo: err.path, mensaje: `Valor inválido: ${err.value}` }],
      timestamp: new Date().toISOString()
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: true,
      mensaje: 'JSON inválido en el cuerpo de la solicitud',
      errores: [{ campo: 'body', mensaje: err.message }],
      timestamp: new Date().toISOString()
    });
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: true,
    mensaje,
    errores: err.errores || [],
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Clase para crear errores personalizados de la API
 */
class APIError extends Error {
  constructor(mensaje, statusCode = 500, errores = []) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errores = errores;
    this.name = 'APIError';
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  formatearErroresValidacion,
  APIError
};
