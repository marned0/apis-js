/**
 * Servicio de validación de códigos SWIFT/BIC
 * Estructura SWIFT: AAAA-BB-CC-DDD
 * - AAAA: Código del banco (4 letras)
 * - BB: Código del país (2 letras, ISO 3166-1 alpha-2)
 * - CC: Código de localización (2 caracteres alfanuméricos)
 * - DDD: Código de sucursal (3 caracteres alfanuméricos, opcional)
 */

// Base de datos simplificada de algunos códigos SWIFT conocidos
const BANCOS_SWIFT = {
  'BSCHESMM': { banco: 'BANCO SANTANDER', pais: 'ES', ciudad: 'Madrid' },
  'BBVAESMM': { banco: 'BANCO BILBAO VIZCAYA ARGENTARIA', pais: 'ES', ciudad: 'Madrid' },
  'CABORUMM': { banco: 'BANKIA', pais: 'ES', ciudad: 'Madrid' },
  'CAIXESBB': { banco: 'CAIXABANK', pais: 'ES', ciudad: 'Barcelona' },
  'SABSESBB': { banco: 'BANCO DE SABADELL', pais: 'ES', ciudad: 'Barcelona' },
  'INGDESMM': { banco: 'ING BANK', pais: 'ES', ciudad: 'Madrid' },
  'DEUTDEFF': { banco: 'DEUTSCHE BANK', pais: 'DE', ciudad: 'Frankfurt' },
  'BNPAFRPP': { banco: 'BNP PARIBAS', pais: 'FR', ciudad: 'Paris' },
  'CHASUS33': { banco: 'JPMORGAN CHASE BANK', pais: 'US', ciudad: 'New York' },
  'BABORUMM': { banco: 'BANCO POPULAR ESPAÑOL', pais: 'ES', ciudad: 'Madrid' }
};

// Nombres de países por código ISO
const PAISES = {
  'ES': 'España',
  'DE': 'Alemania',
  'FR': 'Francia',
  'IT': 'Italia',
  'PT': 'Portugal',
  'GB': 'Reino Unido',
  'US': 'Estados Unidos',
  'CH': 'Suiza',
  'NL': 'Países Bajos',
  'BE': 'Bélgica',
  'AT': 'Austria',
  'AD': 'Andorra',
  'LU': 'Luxemburgo'
};

/**
 * Valida el formato de un código SWIFT/BIC
 * @param {string} swift - Código SWIFT a validar
 * @returns {Object} - Resultado de la validación de formato
 */
const validarFormatoSWIFT = (swift) => {
  const errores = [];

  if (!swift || typeof swift !== 'string') {
    return {
      esValido: false,
      errores: ['El código SWIFT es obligatorio']
    };
  }

  const swiftLimpio = swift.toUpperCase().replace(/[\s\-]/g, '');

  // SWIFT debe tener 8 u 11 caracteres
  if (swiftLimpio.length !== 8 && swiftLimpio.length !== 11) {
    errores.push('El código SWIFT debe tener 8 u 11 caracteres');
  }

  // Verificar estructura: 4 letras + 2 letras + 2 alfanuméricos + (opcional 3 alfanuméricos)
  if (swiftLimpio.length >= 8) {
    // Código del banco (4 letras)
    if (!/^[A-Z]{4}/.test(swiftLimpio)) {
      errores.push('Los primeros 4 caracteres deben ser letras (código del banco)');
    }

    // Código del país (2 letras)
    if (!/^.{4}[A-Z]{2}/.test(swiftLimpio)) {
      errores.push('Los caracteres 5-6 deben ser letras (código del país)');
    }

    // Código de localización (2 alfanuméricos)
    if (!/^.{6}[A-Z0-9]{2}/.test(swiftLimpio)) {
      errores.push('Los caracteres 7-8 deben ser alfanuméricos (código de localización)');
    }

    // Código de sucursal opcional (3 alfanuméricos)
    if (swiftLimpio.length === 11 && !/^.{8}[A-Z0-9]{3}$/.test(swiftLimpio)) {
      errores.push('Los caracteres 9-11 deben ser alfanuméricos (código de sucursal)');
    }
  }

  return {
    esValido: errores.length === 0,
    errores,
    swiftLimpio
  };
};

/**
 * Extrae los componentes de un código SWIFT
 * @param {string} swift - Código SWIFT
 * @returns {Object} - Componentes del SWIFT
 */
const parsearSWIFT = (swift) => {
  const swiftLimpio = swift.toUpperCase().replace(/[\s\-]/g, '');

  if (swiftLimpio.length < 8) {
    return null;
  }

  return {
    codigoBanco: swiftLimpio.substring(0, 4),
    codigoPais: swiftLimpio.substring(4, 6),
    codigoLocalizacion: swiftLimpio.substring(6, 8),
    codigoSucursal: swiftLimpio.length === 11 ? swiftLimpio.substring(8, 11) : null,
    swift8: swiftLimpio.substring(0, 8),
    swift11: swiftLimpio.length === 11 ? swiftLimpio : swiftLimpio + 'XXX'
  };
};

/**
 * Consulta información de un código SWIFT
 * @param {string} swift - Código SWIFT a consultar
 * @returns {Object} - Información del código SWIFT
 */
const consultarSWIFT = (swift) => {
  const formatoValidacion = validarFormatoSWIFT(swift);

  if (!formatoValidacion.esValido) {
    return {
      swift: swift || '',
      esValido: false,
      banco: '',
      pais: '',
      ciudad: '',
      mensaje: 'Código SWIFT inválido',
      errores: formatoValidacion.errores
    };
  }

  const swiftLimpio = formatoValidacion.swiftLimpio;
  const componentes = parsearSWIFT(swiftLimpio);
  
  // Buscar en la base de datos (usando los primeros 8 caracteres)
  const swift8 = swiftLimpio.substring(0, 8);
  const infoBanco = BANCOS_SWIFT[swift8];

  if (infoBanco) {
    return {
      swift: swiftLimpio,
      esValido: true,
      banco: infoBanco.banco,
      pais: infoBanco.pais,
      ciudad: infoBanco.ciudad,
      mensaje: 'Código SWIFT válido',
      errores: [],
      detalles: {
        codigoBanco: componentes.codigoBanco,
        codigoPais: componentes.codigoPais,
        codigoLocalizacion: componentes.codigoLocalizacion,
        codigoSucursal: componentes.codigoSucursal,
        nombrePais: PAISES[componentes.codigoPais] || componentes.codigoPais
      }
    };
  }

  // Si no está en la base de datos, validar solo el formato
  return {
    swift: swiftLimpio,
    esValido: true,
    banco: `Banco con código ${componentes.codigoBanco}`,
    pais: componentes.codigoPais,
    ciudad: '',
    mensaje: 'Código SWIFT válido (banco no encontrado en base de datos)',
    errores: [],
    detalles: {
      codigoBanco: componentes.codigoBanco,
      codigoPais: componentes.codigoPais,
      codigoLocalizacion: componentes.codigoLocalizacion,
      codigoSucursal: componentes.codigoSucursal,
      nombrePais: PAISES[componentes.codigoPais] || componentes.codigoPais
    }
  };
};

module.exports = {
  consultarSWIFT,
  validarFormatoSWIFT,
  parsearSWIFT,
  BANCOS_SWIFT,
  PAISES
};
