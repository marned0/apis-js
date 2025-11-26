const mongoose = require('mongoose');

const DireccionesSchema = new mongoose.Schema({
  codigo_postal: {
    type: String,
    required: true,
    maxlength: 15,
    index: true
  },
  poblacion: {
    type: String,
    required: true,
    maxlength: 255,
    index: true
  },
  provincia: {
    type: String,
    required: true,
    maxlength: 255
  },
  pais: {
    type: String,
    required: true,
    maxlength: 255,
    default: 'España'
  }
}, {
  timestamps: true,
  collection: 'direcciones'
});

// Índice compuesto para búsquedas eficientes
DireccionesSchema.index({ codigo_postal: 1, poblacion: 1 });

module.exports = mongoose.model('Direcciones', DireccionesSchema);
