/**
 * Controlador para generación de IBAN
 */

const ibanService = require('../services/IbanService');

/**
 * POST /api/generar-iban
 * Genera un IBAN válido a partir de datos bancarios
 */
const generarIban = async (req, res, next) => {
  try {
    const { pais, entidad, sucursal, digitoControl, numeroCuenta } = req.body;

    const resultado = ibanService.generarIBAN({
      pais,
      entidad,
      sucursal,
      digitoControl,
      numeroCuenta
    });

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generarIban
};
