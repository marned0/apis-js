/**
 * Controlador para consulta de códigos SWIFT
 */

const swiftService = require('../services/SwiftService');

/**
 * POST /api/consultar-swift
 * Consulta información de código SWIFT/BIC
 */
const consultarSwift = async (req, res, next) => {
  try {
    const { swift } = req.body;

    const resultado = swiftService.consultarSWIFT(swift);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  consultarSwift
};
