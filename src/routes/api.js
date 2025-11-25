/**
 * Definición de rutas de la API
 */

const express = require('express');
const router = express.Router();

// Middleware de validación
const { validate } = require('../middleware/validator');

// Esquemas de validación
const {
  validarCodigoPostal,
  validarPoblacion,
  validarDocumento,
  validarIBAN,
  validarGenerarIBAN,
  validarSWIFT
} = require('../validators/validationSchemas');

// Controladores
const { buscarPorCodigoPostal } = require('../controllers/BuscadorCodigoPostalController');
const { buscarPorPoblacion } = require('../controllers/BuscadorPoblacionController');
const { validarDocumento: validarDocumentoHandler } = require('../controllers/ValidadorDocumentoController');
const { validarIban } = require('../controllers/ValidadorIbanController');
const { generarIban } = require('../controllers/GeneradorIbanController');
const { consultarSwift } = require('../controllers/ConsultorSwiftController');

/**
 * @swagger
 * /api/buscar-por-codigo-postal:
 *   post:
 *     summary: Busca información de municipio por código postal
 *     tags: [Direcciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoPostal
 *             properties:
 *               codigoPostal:
 *                 type: string
 *                 description: Código postal de 5 dígitos
 *                 example: "28001"
 *     responses:
 *       200:
 *         description: Resultado de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 codigoPostal:
 *                   type: string
 *                 poblacion:
 *                   type: string
 *                 poblaciones:
 *                   type: array
 *                   items:
 *                     type: string
 *                 provincia:
 *                   type: string
 *                 pais:
 *                   type: string
 *                 valido:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *       422:
 *         description: Error de validación
 */
router.post('/buscar-por-codigo-postal', validarCodigoPostal, validate, buscarPorCodigoPostal);

/**
 * @swagger
 * /api/buscar-por-poblacion:
 *   post:
 *     summary: Busca códigos postales por nombre de población
 *     tags: [Direcciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poblacion
 *             properties:
 *               poblacion:
 *                 type: string
 *                 description: Nombre de la población (mínimo 3 caracteres)
 *                 example: "Madrid"
 *     responses:
 *       200:
 *         description: Resultado de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poblacion:
 *                   type: string
 *                 provincia:
 *                   type: string
 *                 pais:
 *                   type: string
 *                 codigosPostales:
 *                   type: array
 *                   items:
 *                     type: string
 *                 total:
 *                   type: integer
 *                 mensaje:
 *                   type: string
 *       422:
 *         description: Error de validación
 */
router.post('/buscar-por-poblacion', validarPoblacion, validate, buscarPorPoblacion);

/**
 * @swagger
 * /api/validar-documento:
 *   post:
 *     summary: Valida documentos de identidad españoles (NIF, CIF, NIE, Pasaporte)
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroDocumento
 *             properties:
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento (8-12 caracteres)
 *                 example: "12345678Z"
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numeroDocumento:
 *                   type: string
 *                 esValido:
 *                   type: boolean
 *                 tipoDocumento:
 *                   type: string
 *                   enum: [NIF, CIF, NIE, PASAPORTE, DESCONOCIDO]
 *                 documentoLimpio:
 *                   type: string
 *                 mensaje:
 *                   type: string
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: string
 *                 detalles:
 *                   type: object
 *       422:
 *         description: Error de validación
 */
router.post('/validar-documento', validarDocumento, validate, validarDocumentoHandler);

/**
 * @swagger
 * /api/validar-iban:
 *   post:
 *     summary: Valida un número IBAN
 *     tags: [Bancarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - iban
 *             properties:
 *               iban:
 *                 type: string
 *                 description: Número IBAN a validar
 *                 example: "ES9121000418450200051332"
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 iban:
 *                   type: string
 *                 esValido:
 *                   type: boolean
 *                 pais:
 *                   type: string
 *                 codigoBanco:
 *                   type: string
 *                 numeroCuenta:
 *                   type: string
 *                 digitosVerificacion:
 *                   type: string
 *                 mensaje:
 *                   type: string
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: string
 *       422:
 *         description: Error de validación
 */
router.post('/validar-iban', validarIBAN, validate, validarIban);

/**
 * @swagger
 * /api/generar-iban:
 *   post:
 *     summary: Genera un IBAN válido a partir de datos bancarios
 *     tags: [Bancarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pais
 *               - entidad
 *               - sucursal
 *               - digitoControl
 *               - numeroCuenta
 *             properties:
 *               pais:
 *                 type: string
 *                 description: Código de país (ES para España)
 *                 example: "ES"
 *               entidad:
 *                 type: string
 *                 description: Código de entidad (4 dígitos)
 *                 example: "2100"
 *               sucursal:
 *                 type: string
 *                 description: Código de sucursal (4 dígitos)
 *                 example: "0418"
 *               digitoControl:
 *                 type: string
 *                 description: Dígito de control (2 dígitos)
 *                 example: "45"
 *               numeroCuenta:
 *                 type: string
 *                 description: Número de cuenta (10 dígitos)
 *                 example: "0200051332"
 *     responses:
 *       200:
 *         description: IBAN generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 iban:
 *                   type: string
 *                 esValido:
 *                   type: boolean
 *                 pais:
 *                   type: string
 *                 codigoBanco:
 *                   type: string
 *                 mensaje:
 *                   type: string
 *       422:
 *         description: Error de validación
 */
router.post('/generar-iban', validarGenerarIBAN, validate, generarIban);

/**
 * @swagger
 * /api/consultar-swift:
 *   post:
 *     summary: Consulta información de código SWIFT/BIC
 *     tags: [Bancarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - swift
 *             properties:
 *               swift:
 *                 type: string
 *                 description: Código SWIFT/BIC (8 u 11 caracteres)
 *                 example: "BSCHESMM"
 *     responses:
 *       200:
 *         description: Información del código SWIFT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 swift:
 *                   type: string
 *                 esValido:
 *                   type: boolean
 *                 banco:
 *                   type: string
 *                 pais:
 *                   type: string
 *                 ciudad:
 *                   type: string
 *                 mensaje:
 *                   type: string
 *       422:
 *         description: Error de validación
 */
router.post('/consultar-swift', validarSWIFT, validate, consultarSwift);

module.exports = router;
