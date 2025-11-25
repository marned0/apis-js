/**
 * Esquemas de validación con express-validator
 * Replican las validaciones de Symfony
 */

const { body, validationResult } = require('express-validator');

/**
 * Validación para búsqueda por código postal
 * - NotBlank: El código postal es obligatorio
 * - Length: Exactamente 5 dígitos
 * - Regex: Solo números
 */
const validarCodigoPostal = [
  body('codigoPostal')
    .notEmpty()
    .withMessage('El código postal es obligatorio')
    .isLength({ min: 5, max: 5 })
    .withMessage('El código postal debe tener exactamente 5 dígitos')
    .matches(/^\d{5}$/)
    .withMessage('El código postal debe contener solo números')
];

/**
 * Validación para búsqueda por población
 * - NotBlank: La población es obligatoria
 * - Length: Mínimo 3 caracteres
 */
const validarPoblacion = [
  body('poblacion')
    .notEmpty()
    .withMessage('La población es obligatoria')
    .isLength({ min: 3 })
    .withMessage('La población debe tener al menos 3 caracteres')
    .trim()
];

/**
 * Validación para documento de identidad
 * - NotBlank: El número de documento es obligatorio
 * - Length: Mínimo 8, máximo 12 caracteres
 */
const validarDocumento = [
  body('numeroDocumento')
    .notEmpty()
    .withMessage('El número de documento es obligatorio')
    .isLength({ min: 8, max: 12 })
    .withMessage('El número de documento debe tener entre 8 y 12 caracteres')
    .trim()
];

/**
 * Validación para IBAN
 * - NotBlank: El IBAN es obligatorio
 * - Formato básico de IBAN
 */
const validarIBAN = [
  body('iban')
    .notEmpty()
    .withMessage('El IBAN es obligatorio')
    .isLength({ min: 15, max: 34 })
    .withMessage('El IBAN debe tener entre 15 y 34 caracteres')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i)
    .withMessage('El formato del IBAN no es válido')
    .customSanitizer(value => value ? value.toUpperCase().replace(/[\s\-]/g, '') : value)
];

/**
 * Validación para generación de IBAN
 */
const validarGenerarIBAN = [
  body('pais')
    .notEmpty()
    .withMessage('El código de país es obligatorio')
    .isLength({ min: 2, max: 2 })
    .withMessage('El código de país debe tener 2 caracteres')
    .isAlpha()
    .withMessage('El código de país debe contener solo letras')
    .customSanitizer(value => value ? value.toUpperCase() : value),
  body('entidad')
    .notEmpty()
    .withMessage('El código de entidad es obligatorio')
    .matches(/^\d{4}$/)
    .withMessage('El código de entidad debe tener exactamente 4 dígitos'),
  body('sucursal')
    .notEmpty()
    .withMessage('El código de sucursal es obligatorio')
    .matches(/^\d{4}$/)
    .withMessage('El código de sucursal debe tener exactamente 4 dígitos'),
  body('digitoControl')
    .notEmpty()
    .withMessage('El dígito de control es obligatorio')
    .matches(/^\d{2}$/)
    .withMessage('El dígito de control debe tener exactamente 2 dígitos'),
  body('numeroCuenta')
    .notEmpty()
    .withMessage('El número de cuenta es obligatorio')
    .matches(/^\d{10}$/)
    .withMessage('El número de cuenta debe tener exactamente 10 dígitos')
];

/**
 * Validación para código SWIFT
 * - NotBlank: El SWIFT es obligatorio
 * - Length: 8 u 11 caracteres
 */
const validarSWIFT = [
  body('swift')
    .notEmpty()
    .withMessage('El código SWIFT es obligatorio')
    .custom((value) => {
      const limpio = value.replace(/[\s\-]/g, '');
      if (limpio.length !== 8 && limpio.length !== 11) {
        throw new Error('El código SWIFT debe tener 8 u 11 caracteres');
      }
      return true;
    })
    .matches(/^[A-Z0-9]+$/i)
    .withMessage('El código SWIFT debe contener solo caracteres alfanuméricos')
    .customSanitizer(value => value ? value.toUpperCase().replace(/[\s\-]/g, '') : value)
];

module.exports = {
  validarCodigoPostal,
  validarPoblacion,
  validarDocumento,
  validarIBAN,
  validarGenerarIBAN,
  validarSWIFT
};
