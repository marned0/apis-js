/**
 * Controlador para búsqueda por código postal
 */

const mongoose = require('mongoose');
const Direcciones = require('../models/Direcciones');

/**
 * POST /api/buscar-por-codigo-postal
 * Busca información de municipio por código postal
 */
const buscarPorCodigoPostal = async (req, res, next) => {
  try {
    const { codigoPostal } = req.body;

    // Verificar si MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: true,
        mensaje: 'Base de datos no disponible. Configure MONGODB_URI para usar este endpoint.',
        codigoPostal,
        valido: false
      });
    }

    // Buscar en la base de datos usando el nombre de campo de la BD (codigo_postal)
    const resultados = await Direcciones.find({ codigo_postal: codigoPostal })
      .select('codigo_postal poblacion provincia pais')
      .lean();

    if (resultados.length === 0) {
      return res.status(200).json({
        codigoPostal,
        poblacion: null,
        poblaciones: [],
        provincia: null,
        pais: null,
        valido: false,
        mensaje: 'Código postal no encontrado'
      });
    }

    // Extraer poblaciones únicas
    const poblaciones = [...new Set(resultados.map(r => r.poblacion))];
    const primerResultado = resultados[0];

    res.json({
      codigoPostal,
      poblacion: primerResultado.poblacion,
      poblaciones,
      provincia: primerResultado.provincia,
      pais: primerResultado.pais,
      valido: true,
      mensaje: 'Código postal encontrado'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buscarPorCodigoPostal
};
