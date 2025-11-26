/**
 * Configuración de Swagger para documentación de la API
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Validaciones',
      version: '1.0.0',
      description: `
API de validaciones en Node.js con Express y Mongoose.

Esta API proporciona endpoints para:
- Búsqueda de direcciones por código postal y población
- Validación de documentos de identidad españoles (NIF, CIF, NIE, Pasaporte)
- Validación y generación de IBAN
- Consulta de códigos SWIFT/BIC

## Características

- Validaciones completas según estándares españoles
- Algoritmos de validación (módulo 23 para NIF, módulo 97 para IBAN)
- Respuestas consistentes en formato JSON
- Documentación completa con ejemplos

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200    | Operación exitosa |
| 400    | Solicitud incorrecta |
| 404    | Recurso no encontrado |
| 422    | Error de validación |
| 500    | Error interno del servidor |
      `,
      contact: {
        name: 'Soporte API',
        email: 'soporte@ejemplo.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'Direcciones',
        description: 'Endpoints para búsqueda de direcciones y códigos postales'
      },
      {
        name: 'Documentos',
        description: 'Validación de documentos de identidad españoles'
      },
      {
        name: 'Bancarios',
        description: 'Validación de IBAN y códigos SWIFT'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              example: true
            },
            mensaje: {
              type: 'string',
              example: 'Error de validación'
            },
            errores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: {
                    type: 'string'
                  },
                  mensaje: {
                    type: 'string'
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CodigoPostalRequest: {
          type: 'object',
          required: ['codigoPostal'],
          properties: {
            codigoPostal: {
              type: 'string',
              pattern: '^\\d{5}$',
              example: '28001',
              description: 'Código postal español de 5 dígitos'
            }
          }
        },
        CodigoPostalResponse: {
          type: 'object',
          properties: {
            codigoPostal: {
              type: 'string',
              example: '28001'
            },
            poblacion: {
              type: 'string',
              example: 'Madrid'
            },
            poblaciones: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Madrid']
            },
            provincia: {
              type: 'string',
              example: 'Madrid'
            },
            pais: {
              type: 'string',
              example: 'España'
            },
            valido: {
              type: 'boolean',
              example: true
            },
            mensaje: {
              type: 'string',
              example: 'Código postal encontrado'
            }
          }
        },
        PoblacionRequest: {
          type: 'object',
          required: ['poblacion'],
          properties: {
            poblacion: {
              type: 'string',
              minLength: 3,
              example: 'Madrid',
              description: 'Nombre de la población (mínimo 3 caracteres)'
            }
          }
        },
        PoblacionResponse: {
          type: 'object',
          properties: {
            poblacion: {
              type: 'string',
              example: 'Madrid'
            },
            provincia: {
              type: 'string',
              example: 'Madrid'
            },
            pais: {
              type: 'string',
              example: 'España'
            },
            codigosPostales: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['28001', '28002', '28003']
            },
            total: {
              type: 'integer',
              example: 123
            },
            mensaje: {
              type: 'string',
              example: 'Códigos postales encontrados'
            }
          }
        },
        DocumentoRequest: {
          type: 'object',
          required: ['numeroDocumento'],
          properties: {
            numeroDocumento: {
              type: 'string',
              minLength: 8,
              maxLength: 12,
              example: '12345678Z',
              description: 'Número de documento (NIF, CIF, NIE o Pasaporte)'
            }
          }
        },
        DocumentoResponse: {
          type: 'object',
          properties: {
            numeroDocumento: {
              type: 'string',
              example: '12345678Z'
            },
            esValido: {
              type: 'boolean',
              example: true
            },
            tipoDocumento: {
              type: 'string',
              enum: ['NIF', 'CIF', 'NIE', 'PASAPORTE', 'DESCONOCIDO'],
              example: 'NIF'
            },
            documentoLimpio: {
              type: 'string',
              example: '12345678Z'
            },
            mensaje: {
              type: 'string',
              example: 'Documento válido'
            },
            errores: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            detalles: {
              type: 'object',
              properties: {
                numero: {
                  type: 'string'
                },
                letra: {
                  type: 'string'
                },
                letraEsperada: {
                  type: 'string'
                }
              }
            }
          }
        },
        IbanValidarRequest: {
          type: 'object',
          required: ['iban'],
          properties: {
            iban: {
              type: 'string',
              example: 'ES9121000418450200051332',
              description: 'Número IBAN a validar'
            }
          }
        },
        IbanResponse: {
          type: 'object',
          properties: {
            iban: {
              type: 'string',
              example: 'ES9121000418450200051332'
            },
            esValido: {
              type: 'boolean',
              example: true
            },
            pais: {
              type: 'string',
              example: 'ES'
            },
            codigoBanco: {
              type: 'string',
              example: '2100'
            },
            numeroCuenta: {
              type: 'string',
              example: '0418450200051332'
            },
            digitosVerificacion: {
              type: 'string',
              example: '91'
            },
            mensaje: {
              type: 'string',
              example: 'IBAN válido'
            },
            errores: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        IbanGenerarRequest: {
          type: 'object',
          required: ['pais', 'entidad', 'sucursal', 'digitoControl', 'numeroCuenta'],
          properties: {
            pais: {
              type: 'string',
              example: 'ES',
              description: 'Código de país (2 letras)'
            },
            entidad: {
              type: 'string',
              pattern: '^\\d{4}$',
              example: '2100',
              description: 'Código de entidad (4 dígitos)'
            },
            sucursal: {
              type: 'string',
              pattern: '^\\d{4}$',
              example: '0418',
              description: 'Código de sucursal (4 dígitos)'
            },
            digitoControl: {
              type: 'string',
              pattern: '^\\d{2}$',
              example: '45',
              description: 'Dígito de control (2 dígitos)'
            },
            numeroCuenta: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '0200051332',
              description: 'Número de cuenta (10 dígitos)'
            }
          }
        },
        SwiftRequest: {
          type: 'object',
          required: ['swift'],
          properties: {
            swift: {
              type: 'string',
              example: 'BSCHESMM',
              description: 'Código SWIFT/BIC (8 u 11 caracteres)'
            }
          }
        },
        SwiftResponse: {
          type: 'object',
          properties: {
            swift: {
              type: 'string',
              example: 'BSCHESMM'
            },
            esValido: {
              type: 'boolean',
              example: true
            },
            banco: {
              type: 'string',
              example: 'BANCO SANTANDER'
            },
            pais: {
              type: 'string',
              example: 'ES'
            },
            ciudad: {
              type: 'string',
              example: 'Madrid'
            },
            mensaje: {
              type: 'string',
              example: 'Código SWIFT válido'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API de Validaciones - Documentación'
  }));

  // Endpoint para obtener el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = { setupSwagger, specs };
