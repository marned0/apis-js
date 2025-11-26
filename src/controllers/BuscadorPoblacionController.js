/**
 * Controlador para búsqueda por población
 */

const mongoose = require('mongoose');
const Direcciones = require('../models/Direcciones');

/**
 * Escapa caracteres especiales de regex
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * POST /api/buscar-por-poblacion
 * Busca códigos postales por nombre de población
 */
const buscarPorPoblacion = async (req, res, next) => {
  try {
    const { poblacion } = req.body;

    // Verificar si MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: true,
        mensaje: 'Base de datos no disponible. Configure MONGODB_URI para usar este endpoint.',
        poblacion,
        codigosPostales: [],
        total: 0
      });
    }

    // Escapar caracteres especiales para evitar inyección de regex
    const poblacionEscapada = escapeRegex(poblacion);

    // Buscar por nombre de población (case insensitive)
    const resultados = await Direcciones.find({
      poblacion: { $regex: new RegExp(`^${poblacionEscapada}$`, 'i') }
    })
      .select('codigo_postal poblacion provincia pais')
      .lean();

    if (resultados.length === 0) {
      // Buscar por coincidencia parcial si no hay resultados exactos
      const resultadosParciales = await Direcciones.find({
        poblacion: { $regex: new RegExp(poblacionEscapada, 'i') }
      })
        .select('codigo_postal poblacion provincia pais')
        .lean();

      if (resultadosParciales.length === 0) {
        return res.status(200).json({
          poblacion,
          provincia: null,
          pais: null,
          codigosPostales: [],
          total: 0,
          mensaje: 'No se encontraron códigos postales para esta población'
        });
      }

      // Usar resultados parciales - usar codigo_postal del documento
      const codigosPostales = [...new Set(resultadosParciales.map(r => r.codigo_postal))].sort();
      const primerResultado = resultadosParciales[0];

      return res.json({
        poblacion: primerResultado.poblacion,
        provincia: primerResultado.provincia,
        pais: primerResultado.pais,
        codigosPostales,
        total: codigosPostales.length,
        mensaje: 'Códigos postales encontrados'
      });
    }

    // Extraer códigos postales únicos - usar codigo_postal del documento
    const codigosPostales = [...new Set(resultados.map(r => r.codigo_postal))].sort();
    const primerResultado = resultados[0];

    res.json({
      poblacion: primerResultado.poblacion,
      provincia: primerResultado.provincia,
      pais: primerResultado.pais,
      codigosPostales,
      total: codigosPostales.length,
      mensaje: 'Códigos postales encontrados'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buscarPorPoblacion
};
