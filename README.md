# API de Validaciones

API de validaciones en Node.js con Express y Mongoose. Esta API proporciona endpoints para validar y consultar información de documentos de identidad, IBAN, códigos SWIFT y direcciones postales españolas.

## 🚀 Características

- **Búsqueda de direcciones** por código postal y población
- **Validación de documentos** españoles (NIF, CIF, NIE, Pasaporte)
- **Validación y generación de IBAN** con algoritmo módulo 97
- **Consulta de códigos SWIFT/BIC**
- Documentación Swagger completa
- Manejo de errores consistente
- Seguridad con Helmet y CORS configurado

## 📋 Requisitos Previos

- Node.js >= 16.x
- MongoDB >= 4.4 (opcional, solo para endpoints de direcciones)
- npm o yarn

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd validaciones-api-js
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌐 Endpoints

### Direcciones

#### POST /api/buscar-por-codigo-postal
Busca información de municipio por código postal.

```bash
curl -X POST http://localhost:3000/api/buscar-por-codigo-postal \
  -H "Content-Type: application/json" \
  -d '{"codigoPostal": "28001"}'
```

**Respuesta:**
```json
{
  "codigoPostal": "28001",
  "poblacion": "Madrid",
  "poblaciones": ["Madrid"],
  "provincia": "Madrid",
  "pais": "España",
  "valido": true,
  "mensaje": "Código postal encontrado"
}
```

#### POST /api/buscar-por-poblacion
Busca códigos postales por nombre de población.

```bash
curl -X POST http://localhost:3000/api/buscar-por-poblacion \
  -H "Content-Type: application/json" \
  -d '{"poblacion": "Madrid"}'
```

**Respuesta:**
```json
{
  "poblacion": "Madrid",
  "provincia": "Madrid",
  "pais": "España",
  "codigosPostales": ["28001", "28002", "..."],
  "total": 123,
  "mensaje": "Códigos postales encontrados"
}
```

### Documentos

#### POST /api/validar-documento
Valida documentos de identidad españoles (NIF, CIF, NIE, Pasaporte).

```bash
curl -X POST http://localhost:3000/api/validar-documento \
  -H "Content-Type: application/json" \
  -d '{"numeroDocumento": "12345678Z"}'
```

**Respuesta:**
```json
{
  "numeroDocumento": "12345678Z",
  "esValido": true,
  "tipoDocumento": "NIF",
  "documentoLimpio": "12345678Z",
  "mensaje": "Documento válido",
  "errores": [],
  "detalles": {
    "numero": "12345678",
    "letra": "Z",
    "letraEsperada": "Z"
  }
}
```

### Bancarios

#### POST /api/validar-iban
Valida un número IBAN.

```bash
curl -X POST http://localhost:3000/api/validar-iban \
  -H "Content-Type: application/json" \
  -d '{"iban": "ES9121000418450200051332"}'
```

**Respuesta:**
```json
{
  "iban": "ES9121000418450200051332",
  "esValido": true,
  "pais": "ES",
  "codigoBanco": "2100",
  "numeroCuenta": "0418450200051332",
  "digitosVerificacion": "91",
  "mensaje": "IBAN válido",
  "errores": []
}
```

#### POST /api/generar-iban
Genera un IBAN válido a partir de datos bancarios.

```bash
curl -X POST http://localhost:3000/api/generar-iban \
  -H "Content-Type: application/json" \
  -d '{
    "pais": "ES",
    "entidad": "2100",
    "sucursal": "0418",
    "digitoControl": "45",
    "numeroCuenta": "0200051332"
  }'
```

**Respuesta:**
```json
{
  "iban": "ES9121000418450200051332",
  "esValido": true,
  "pais": "ES",
  "codigoBanco": "2100",
  "mensaje": "IBAN generado correctamente"
}
```

#### POST /api/consultar-swift
Consulta información de código SWIFT/BIC.

```bash
curl -X POST http://localhost:3000/api/consultar-swift \
  -H "Content-Type: application/json" \
  -d '{"swift": "BSCHESMM"}'
```

**Respuesta:**
```json
{
  "swift": "BSCHESMM",
  "esValido": true,
  "banco": "BANCO SANTANDER",
  "pais": "ES",
  "ciudad": "Madrid",
  "mensaje": "Código SWIFT válido"
}
```

## 📚 Documentación

La documentación interactiva de Swagger está disponible en:
```
http://localhost:3000/api-docs
```

## 🔧 Configuración

Variables de entorno disponibles (ver `.env.example`):

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| NODE_ENV | Entorno de ejecución | development |
| PORT | Puerto del servidor | 3000 |
| MONGODB_URI | URI de conexión a MongoDB | - |
| CORS_ORIGIN | Origen permitido para CORS | * |
| LOG_LEVEL | Nivel de logging | debug |

## 📐 Estructura del Proyecto

```
/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── models/
│   │   └── Direcciones.js       # Modelo Mongoose
│   ├── controllers/
│   │   ├── BuscadorCodigoPostalController.js
│   │   ├── BuscadorPoblacionController.js
│   │   ├── ValidadorDocumentoController.js
│   │   ├── ValidadorIbanController.js
│   │   ├── GeneradorIbanController.js
│   │   └── ConsultorSwiftController.js
│   ├── validators/
│   │   └── validationSchemas.js  # Validaciones express-validator
│   ├── services/
│   │   ├── DocumentoService.js   # Lógica NIF/CIF/NIE/Pasaporte
│   │   ├── IbanService.js        # Lógica IBAN
│   │   └── SwiftService.js       # Lógica SWIFT
│   ├── routes/
│   │   └── api.js                # Definición de rutas
│   ├── middleware/
│   │   ├── errorHandler.js       # Manejador de errores
│   │   └── validator.js          # Middleware de validación
│   └── app.js                    # Configuración de Express
├── swagger/
│   └── swagger.js                # Configuración de Swagger
├── .env.example                  # Variables de entorno ejemplo
├── .gitignore
├── package.json
├── server.js                     # Punto de entrada
└── README.md
```

## 🧪 Tests

```bash
npm test
```

## 🔐 Algoritmos de Validación

### NIF (Número de Identificación Fiscal)
- Formato: 8 dígitos + 1 letra
- Validación: Algoritmo módulo 23 con tabla de letras (TRWAGMYFPDXBNJZSQVHLCKE)

### NIE (Número de Identidad de Extranjero)
- Formato: X/Y/Z + 7 dígitos + 1 letra
- Validación: Se convierte X→0, Y→1, Z→2 y se valida como NIF

### CIF (Código de Identificación Fiscal)
- Formato: 1 letra + 7 dígitos + 1 dígito/letra de control
- Validación: Algoritmo de control según tipo de organización

### IBAN
- Validación: Algoritmo módulo 97 según ISO 13616
- Generación: Cálculo de dígitos de control

### SWIFT/BIC
- Formato: 4 letras (banco) + 2 letras (país) + 2 alfanuméricos (ubicación) + 3 alfanuméricos opcionales (sucursal)
- Longitud: 8 u 11 caracteres

## 🐳 Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t validaciones-api .
docker run -p 3000:3000 validaciones-api
```

## 📝 Licencia

ISC

## 👥 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request
