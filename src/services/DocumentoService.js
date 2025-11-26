/**
 * Servicio de validación de documentos de identidad españoles
 * Implementa algoritmos de validación para NIF, CIF, NIE y Pasaporte
 */

// Tabla de letras para validación de NIF (módulo 23)
const LETRAS_NIF = 'TRWAGMYFPDXBNJZSQVHLCKE';

// Letras válidas para CIF
const LETRAS_CIF = 'ABCDEFGHJNPQRSUVW';

// Letras de control para CIF (cuando se requiere letra)
const LETRAS_CONTROL_CIF = 'JABCDEFGHI';

/**
 * Detecta el tipo de documento
 * @param {string} documento - Número de documento
 * @returns {string} - Tipo de documento: NIF, CIF, NIE, PASAPORTE o DESCONOCIDO
 */
const detectarTipoDocumento = (documento) => {
  if (!documento || typeof documento !== 'string') {
    return 'DESCONOCIDO';
  }

  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');

  // NIE: empieza por X, Y o Z seguido de 7 dígitos y una letra
  if (/^[XYZ]\d{7}[A-Z]$/i.test(doc)) {
    return 'NIE';
  }

  // NIF: 8 dígitos + 1 letra
  if (/^\d{8}[A-Z]$/i.test(doc)) {
    return 'NIF';
  }

  // CIF: 1 letra + 7 dígitos + 1 dígito o letra
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i.test(doc)) {
    return 'CIF';
  }

  // Pasaporte: alfanumérico de 6-12 caracteres
  if (/^[A-Z0-9]{6,12}$/i.test(doc)) {
    return 'PASAPORTE';
  }

  return 'DESCONOCIDO';
};

/**
 * Calcula la letra esperada para un NIF
 * @param {string} numero - Los 8 dígitos del NIF
 * @returns {string} - Letra calculada
 */
const calcularLetraNIF = (numero) => {
  const indice = parseInt(numero, 10) % 23;
  return LETRAS_NIF.charAt(indice);
};

/**
 * Valida un NIF (Número de Identificación Fiscal)
 * @param {string} documento - NIF completo (8 dígitos + letra)
 * @returns {Object} - Resultado de la validación
 */
const validarNIF = (documento) => {
  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');
  
  if (!/^\d{8}[A-Z]$/.test(doc)) {
    return {
      esValido: false,
      errores: ['Formato de NIF inválido. Debe ser 8 dígitos seguidos de una letra.'],
      detalles: null
    };
  }

  const numero = doc.substring(0, 8);
  const letra = doc.charAt(8);
  const letraEsperada = calcularLetraNIF(numero);

  const esValido = letra === letraEsperada;

  return {
    esValido,
    errores: esValido ? [] : [`La letra del NIF es incorrecta. Se esperaba '${letraEsperada}'.`],
    detalles: {
      numero,
      letra,
      letraEsperada
    }
  };
};

/**
 * Valida un NIE (Número de Identidad de Extranjero)
 * @param {string} documento - NIE completo (X/Y/Z + 7 dígitos + letra)
 * @returns {Object} - Resultado de la validación
 */
const validarNIE = (documento) => {
  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');
  
  if (!/^[XYZ]\d{7}[A-Z]$/.test(doc)) {
    return {
      esValido: false,
      errores: ['Formato de NIE inválido. Debe ser X, Y o Z seguido de 7 dígitos y una letra.'],
      detalles: null
    };
  }

  // Convertir la primera letra a número
  const letraInicial = doc.charAt(0);
  let prefijo;
  switch (letraInicial) {
    case 'X': prefijo = '0'; break;
    case 'Y': prefijo = '1'; break;
    case 'Z': prefijo = '2'; break;
    default: prefijo = '';
  }

  const numero = prefijo + doc.substring(1, 8);
  const letra = doc.charAt(8);
  const letraEsperada = calcularLetraNIF(numero);

  const esValido = letra === letraEsperada;

  return {
    esValido,
    errores: esValido ? [] : [`La letra del NIE es incorrecta. Se esperaba '${letraEsperada}'.`],
    detalles: {
      numero: doc.substring(0, 8),
      letra,
      letraEsperada,
      numeroEquivalente: numero
    }
  };
};

/**
 * Valida un CIF (Código de Identificación Fiscal)
 * @param {string} documento - CIF completo
 * @returns {Object} - Resultado de la validación
 */
const validarCIF = (documento) => {
  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');
  
  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(doc)) {
    return {
      esValido: false,
      errores: ['Formato de CIF inválido.'],
      detalles: null
    };
  }

  const letraInicial = doc.charAt(0);
  const numeros = doc.substring(1, 8);
  const digitoControl = doc.charAt(8);

  // Calcular dígito de control
  let sumaPares = 0;
  let sumaImpares = 0;

  for (let i = 0; i < 7; i++) {
    const digito = parseInt(numeros.charAt(i), 10);
    const posicion = i + 1; // Posición 1-indexed para el algoritmo CIF
    
    if (posicion % 2 === 0) {
      // Posiciones pares en numeración 1-indexed (2ª, 4ª, 6ª) - se suman directamente
      sumaPares += digito;
    } else {
      // Posiciones impares en numeración 1-indexed (1ª, 3ª, 5ª, 7ª) - multiplicar por 2 y sumar dígitos
      const doble = digito * 2;
      sumaImpares += doble > 9 ? doble - 9 : doble;
    }
  }

  const sumaTotal = sumaPares + sumaImpares;
  const unidades = sumaTotal % 10;
  const digitoCalculado = unidades === 0 ? 0 : 10 - unidades;
  const letraCalculada = LETRAS_CONTROL_CIF.charAt(digitoCalculado);

  // Determinar si se espera número o letra según el tipo de organización
  const necesitaLetra = ['P', 'Q', 'R', 'S', 'W', 'N'].includes(letraInicial);
  const necesitaNumero = ['A', 'B', 'E', 'H'].includes(letraInicial);

  let esValido = false;
  
  if (necesitaLetra) {
    esValido = digitoControl === letraCalculada;
  } else if (necesitaNumero) {
    esValido = digitoControl === digitoCalculado.toString();
  } else {
    // C, D, F, G, J, U, V pueden tener número o letra
    esValido = digitoControl === digitoCalculado.toString() || digitoControl === letraCalculada;
  }

  return {
    esValido,
    errores: esValido ? [] : ['El dígito de control del CIF es incorrecto.'],
    detalles: {
      letraOrganizacion: letraInicial,
      numeros,
      digitoControl,
      digitoEsperadoNumero: digitoCalculado.toString(),
      digitoEsperadoLetra: letraCalculada
    }
  };
};

/**
 * Valida un pasaporte
 * @param {string} documento - Número de pasaporte
 * @returns {Object} - Resultado de la validación
 */
const validarPasaporte = (documento) => {
  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');
  
  // Pasaporte: alfanumérico de 6-12 caracteres
  const formatoValido = /^[A-Z0-9]{6,12}$/.test(doc);

  return {
    esValido: formatoValido,
    errores: formatoValido ? [] : ['Formato de pasaporte inválido. Debe ser alfanumérico de 6 a 12 caracteres.'],
    detalles: {
      longitud: doc.length
    }
  };
};

/**
 * Valida cualquier tipo de documento
 * @param {string} documento - Número de documento
 * @returns {Object} - Resultado completo de la validación
 */
const validarDocumento = (documento) => {
  if (!documento || typeof documento !== 'string') {
    return {
      numeroDocumento: documento || '',
      esValido: false,
      tipoDocumento: 'DESCONOCIDO',
      documentoLimpio: '',
      mensaje: 'El número de documento es obligatorio',
      errores: ['El número de documento es obligatorio'],
      detalles: null
    };
  }

  const documentoLimpio = documento.toUpperCase().replace(/[\s\-\.]/g, '');
  const tipoDocumento = detectarTipoDocumento(documentoLimpio);

  let resultado;

  switch (tipoDocumento) {
    case 'NIF':
      resultado = validarNIF(documentoLimpio);
      break;
    case 'NIE':
      resultado = validarNIE(documentoLimpio);
      break;
    case 'CIF':
      resultado = validarCIF(documentoLimpio);
      break;
    case 'PASAPORTE':
      resultado = validarPasaporte(documentoLimpio);
      break;
    default:
      resultado = {
        esValido: false,
        errores: ['No se pudo identificar el tipo de documento.'],
        detalles: null
      };
  }

  return {
    numeroDocumento: documento,
    esValido: resultado.esValido,
    tipoDocumento,
    documentoLimpio,
    mensaje: resultado.esValido ? 'Documento válido' : 'Documento inválido',
    errores: resultado.errores,
    detalles: resultado.detalles
  };
};

module.exports = {
  validarDocumento,
  validarNIF,
  validarNIE,
  validarCIF,
  validarPasaporte,
  detectarTipoDocumento,
  calcularLetraNIF
};
