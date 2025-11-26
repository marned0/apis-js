/**
 * Controlador para validación de IBAN
 */

const ibanService = require('../services/IbanService');

/**
 * POST /api/validar-iban
 * Valida un número IBAN
 */
const validarIban = async (req, res, next) => {
  try {
    const { iban } = req.body;

    const resultado = ibanService.validarIBAN(iban);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validarIban
};
