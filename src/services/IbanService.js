/**
 * Servicio de validación y generación de IBAN
 * Implementa el algoritmo de validación módulo 97 según ISO 13616
 */

// Códigos de país con longitud IBAN esperada
const LONGITUDES_IBAN = {
  'ES': 24, // España
  'DE': 22, // Alemania
  'FR': 27, // Francia
  'IT': 27, // Italia
  'PT': 25, // Portugal
  'GB': 22, // Reino Unido
  'BE': 16, // Bélgica
  'NL': 18, // Países Bajos
  'AT': 20, // Austria
  'CH': 21, // Suiza
  'LU': 20, // Luxemburgo
  'AD': 24, // Andorra
  'GI': 23  // Gibraltar
};

/**
 * Convierte letras a números según el estándar IBAN
 * A=10, B=11, ..., Z=35
 * @param {string} char - Carácter a convertir
 * @returns {string} - Número equivalente
 */
const letraANumero = (char) => {
  const codigo = char.charCodeAt(0);
  if (codigo >= 65 && codigo <= 90) {
    return (codigo - 55).toString();
  }
  return char;
};

/**
 * Convierte un IBAN a su representación numérica
 * @param {string} iban - IBAN limpio (sin espacios)
 * @returns {string} - Representación numérica del IBAN
 */
const ibanANumerico = (iban) => {
  // Mover los 4 primeros caracteres al final
  const reordenado = iban.substring(4) + iban.substring(0, 4);
  
  // Convertir letras a números
  let numerico = '';
  for (const char of reordenado) {
    numerico += letraANumero(char);
  }
  
  return numerico;
};

/**
 * Calcula el módulo 97 de un número muy grande (string)
 * @param {string} numerico - Representación numérica del IBAN
 * @returns {number} - Resto de la división por 97
 */
const modulo97 = (numerico) => {
  let resto = 0;
  
  for (let i = 0; i < numerico.length; i++) {
    resto = (resto * 10 + parseInt(numerico.charAt(i), 10)) % 97;
  }
  
  return resto;
};

/**
 * Valida el formato básico de un IBAN
 * @param {string} iban - IBAN a validar
 * @returns {Object} - Resultado de la validación de formato
 */
const validarFormatoIBAN = (iban) => {
  const errores = [];
  
  if (!iban || typeof iban !== 'string') {
    return {
      esValido: false,
      errores: ['El IBAN es obligatorio']
    };
  }

  const ibanLimpio = iban.toUpperCase().replace(/[\s\-]/g, '');

  // Verificar que solo contenga caracteres alfanuméricos
  if (!/^[A-Z0-9]+$/.test(ibanLimpio)) {
    errores.push('El IBAN contiene caracteres inválidos');
  }

  // Verificar longitud mínima
  if (ibanLimpio.length < 15) {
    errores.push('El IBAN es demasiado corto');
  }

  // Verificar longitud máxima
  if (ibanLimpio.length > 34) {
    errores.push('El IBAN es demasiado largo');
  }

  // Verificar que empiece por código de país
  if (!/^[A-Z]{2}/.test(ibanLimpio)) {
    errores.push('El IBAN debe comenzar con un código de país de 2 letras');
  }

  // Verificar dígitos de control
  if (!/^[A-Z]{2}\d{2}/.test(ibanLimpio)) {
    errores.push('El IBAN debe tener 2 dígitos de control después del código de país');
  }

  // Verificar longitud según país
  const codigoPais = ibanLimpio.substring(0, 2);
  if (LONGITUDES_IBAN[codigoPais] && ibanLimpio.length !== LONGITUDES_IBAN[codigoPais]) {
    errores.push(`El IBAN de ${codigoPais} debe tener ${LONGITUDES_IBAN[codigoPais]} caracteres`);
  }

  return {
    esValido: errores.length === 0,
    errores,
    ibanLimpio,
    codigoPais
  };
};

/**
 * Valida un IBAN usando el algoritmo módulo 97
 * @param {string} iban - IBAN a validar
 * @returns {Object} - Resultado de la validación completa
 */
const validarIBAN = (iban) => {
  const formatoValidacion = validarFormatoIBAN(iban);
  
  if (!formatoValidacion.esValido) {
    return {
      iban: iban || '',
      esValido: false,
      pais: '',
      codigoBanco: '',
      numeroCuenta: '',
      digitosVerificacion: '',
      mensaje: 'IBAN inválido',
      errores: formatoValidacion.errores
    };
  }

  const ibanLimpio = formatoValidacion.ibanLimpio;
  const codigoPais = formatoValidacion.codigoPais;
  const digitosVerificacion = ibanLimpio.substring(2, 4);
  
  // Validar con módulo 97
  const numerico = ibanANumerico(ibanLimpio);
  const resto = modulo97(numerico);
  
  if (resto !== 1) {
    return {
      iban,
      esValido: false,
      pais: codigoPais,
      codigoBanco: ibanLimpio.substring(4, 8),
      numeroCuenta: ibanLimpio.substring(8),
      digitosVerificacion,
      mensaje: 'IBAN inválido - dígitos de control incorrectos',
      errores: ['Los dígitos de control del IBAN son incorrectos']
    };
  }

  // Para IBAN español, extraer más detalles
  let codigoBanco = '';
  let numeroCuenta = '';
  
  if (codigoPais === 'ES') {
    codigoBanco = ibanLimpio.substring(4, 8);
    numeroCuenta = ibanLimpio.substring(8);
  } else {
    codigoBanco = ibanLimpio.substring(4, 8);
    numeroCuenta = ibanLimpio.substring(8);
  }

  return {
    iban: ibanLimpio,
    esValido: true,
    pais: codigoPais,
    codigoBanco,
    numeroCuenta,
    digitosVerificacion,
    mensaje: 'IBAN válido',
    errores: []
  };
};

/**
 * Calcula los dígitos de control para un IBAN
 * @param {string} pais - Código de país (2 letras)
 * @param {string} bban - Número de cuenta nacional (sin código de país ni dígitos de control)
 * @returns {string} - Dígitos de control calculados
 */
const calcularDigitosControl = (pais, bban) => {
  // Formar el IBAN temporal con 00 como dígitos de control
  const ibanTemporal = bban + pais + '00';
  
  // Convertir a numérico
  let numerico = '';
  for (const char of ibanTemporal.toUpperCase()) {
    numerico += letraANumero(char);
  }
  
  // Calcular dígitos de control: 98 - (número mod 97)
  const resto = modulo97(numerico);
  const digitos = 98 - resto;
  
  return digitos.toString().padStart(2, '0');
};

/**
 * Genera un IBAN español a partir de los datos bancarios
 * @param {Object} datos - Datos bancarios
 * @param {string} datos.pais - Código de país (ES para España)
 * @param {string} datos.entidad - Código de entidad (4 dígitos)
 * @param {string} datos.sucursal - Código de sucursal (4 dígitos)
 * @param {string} datos.digitoControl - Dígitos de control de la cuenta (2 dígitos)
 * @param {string} datos.numeroCuenta - Número de cuenta (10 dígitos)
 * @returns {Object} - IBAN generado y detalles
 */
const generarIBAN = (datos) => {
  const { pais, entidad, sucursal, digitoControl, numeroCuenta } = datos;
  const errores = [];

  // Validaciones
  if (!pais || pais.toUpperCase() !== 'ES') {
    errores.push('Solo se soporta la generación de IBAN para España (ES)');
  }

  if (!entidad || !/^\d{4}$/.test(entidad)) {
    errores.push('El código de entidad debe tener exactamente 4 dígitos');
  }

  if (!sucursal || !/^\d{4}$/.test(sucursal)) {
    errores.push('El código de sucursal debe tener exactamente 4 dígitos');
  }

  if (!digitoControl || !/^\d{2}$/.test(digitoControl)) {
    errores.push('El dígito de control debe tener exactamente 2 dígitos');
  }

  if (!numeroCuenta || !/^\d{10}$/.test(numeroCuenta)) {
    errores.push('El número de cuenta debe tener exactamente 10 dígitos');
  }

  if (errores.length > 0) {
    return {
      iban: '',
      esValido: false,
      pais: pais || '',
      codigoBanco: entidad || '',
      mensaje: 'Error al generar IBAN',
      errores
    };
  }

  // Formar el BBAN (Basic Bank Account Number)
  const bban = entidad + sucursal + digitoControl + numeroCuenta;
  
  // Calcular dígitos de control del IBAN
  const digitosControlIBAN = calcularDigitosControl(pais.toUpperCase(), bban);
  
  // Formar el IBAN completo
  const iban = pais.toUpperCase() + digitosControlIBAN + bban;

  return {
    iban,
    esValido: true,
    pais: pais.toUpperCase(),
    codigoBanco: entidad,
    mensaje: 'IBAN generado correctamente',
    errores: []
  };
};

/**
 * Parsea un IBAN y extrae sus componentes
 * @param {string} iban - IBAN a parsear
 * @returns {Object} - Componentes del IBAN
 */
const parsearIBAN = (iban) => {
  const ibanLimpio = iban.toUpperCase().replace(/[\s\-]/g, '');
  
  if (ibanLimpio.length < 15) {
    return null;
  }

  const pais = ibanLimpio.substring(0, 2);
  const digitosControl = ibanLimpio.substring(2, 4);
  const bban = ibanLimpio.substring(4);

  // Para IBAN español
  if (pais === 'ES' && bban.length === 20) {
    return {
      pais,
      digitosControl,
      entidad: bban.substring(0, 4),
      sucursal: bban.substring(4, 8),
      digitoControlCuenta: bban.substring(8, 10),
      numeroCuenta: bban.substring(10)
    };
  }

  return {
    pais,
    digitosControl,
    bban
  };
};

module.exports = {
  validarIBAN,
  generarIBAN,
  parsearIBAN,
  validarFormatoIBAN,
  calcularDigitosControl,
  modulo97,
  LONGITUDES_IBAN
};
