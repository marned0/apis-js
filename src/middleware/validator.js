/**
 * Middleware de validación que procesa los resultados de express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Middleware que verifica los resultados de validación
 * Si hay errores, devuelve una respuesta 422
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const erroresFormateados = errors.array().map(error => ({
      campo: error.path || error.param,
      mensaje: error.msg
    }));

    return res.status(422).json({
      error: true,
      mensaje: 'Error de validación',
      errores: erroresFormateados,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  validate
};
