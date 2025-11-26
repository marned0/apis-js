/**
 * Controlador para validación de documentos de identidad
 */

const documentoService = require('../services/DocumentoService');

/**
 * POST /api/validar-documento
 * Valida documentos de identidad españoles (NIF, CIF, NIE, Pasaporte)
 */
const validarDocumento = async (req, res, next) => {
  try {
    const { numeroDocumento } = req.body;

    const resultado = documentoService.validarDocumento(numeroDocumento);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validarDocumento
};
