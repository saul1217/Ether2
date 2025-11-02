# 🔐 Módulo de Autenticación Universal con ENS

Un sistema de autenticación que permite a los usuarios iniciar sesión usando exclusivamente su nombre de dominio ENS (Ethereum Name Service) y una firma criptográfica, eliminando la necesidad de contraseñas o servicios centralizados.

## ✨ Características

- **Autenticación sin contraseña**: Los usuarios se autentican usando su nombre ENS y firma criptográfica
- **Protección contra replay attacks**: Sistema de nonces únicos con expiración temporal
- **Provisión automática de cuentas**: Las cuentas se crean automáticamente en el primer login
- **Validación de ENS**: Verifica la propiedad del nombre ENS directamente en la blockchain
- **Interfaz moderna**: UI limpia y fácil de usar
- **Rate limiting**: Protección contra ataques de fuerza bruta

## 🏗️ Arquitectura

### Frontend (React + Vite)
- Componente de login con ENS
- Integración con MetaMask/WalletConnect
- Dashboard de usuario autenticado

### Backend (Node.js + Express)
- API REST para autenticación
- Validación de firmas criptográficas
- Verificación de propiedad ENS en blockchain
- Sistema de JWT para sesiones
- Protección contra replay attacks con nonces

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Una wallet de Ethereum (MetaMask, WalletConnect, etc.)
- Un nombre ENS (opcional, pero recomendado)

## 🚀 Deploy del Backend como API

Si quieres desplegar el backend como API pública para que otras páginas web la usen:

- ⚡ **Deploy rápido**: `backend/DEPLOY_RAPIDO.md` - Guía rápida de 5 minutos
- 📚 **Deploy completo**: `docs/DEPLOY_API_PRODUCCION.md` - Guía detallada con todas las opciones
- 🌐 **Usar API remota**: `docs/COMO_USAR_API_REMOTA.md` - Cómo integrar la API en otra página web

## 🌐 ¿Quieres Usar una API Remota?

Si alguien ya tiene el backend desplegado, puedes usar solo el frontend:
- Usa el componente `LoginWithENSRemote.jsx` o modifica `LoginWithENS.jsx`
- Ver `API_DOCS.md` para documentación completa de endpoints

## 📁 Estructura del Proyecto

El proyecto está organizado en carpetas separadas:

- **`frontend/`** - Aplicación React (Frontend)
- **`backend/`** - API Node.js/Express (Backend)
- **`docs/`** - Documentación del proyecto

Ver `ESTRUCTURA_PROYECTO.md` para más detalles.

## 🚀 Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend:**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno:**
```bash
cd ../backend
cp env.example .env
```

Edita `backend/.env` y ajusta las configuraciones si es necesario.

**Nota:** También puedes usar el comando rápido:
```bash
npm run setup
```
Este comando instala todas las dependencias y crea el archivo `.env` automáticamente.

## 💻 Uso

### Desarrollo

Para ejecutar el proyecto en modo desarrollo (servidor y cliente simultáneamente):

```bash
# Desde la raíz del proyecto
npm run dev
```

O ejecutar por separado:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Producción

```bash
# Construir frontend
cd frontend
npm run build

# Iniciar backend
cd ../backend
npm start
```

## 📖 Cómo Funciona

### Flujo de Autenticación

1. **Usuario hace clic en "Iniciar Sesión con ENS"**
   - Se solicita conexión de wallet (MetaMask, etc.)

2. **Usuario ingresa su nombre ENS** (opcional si está asociado a la wallet)

3. **Sistema obtiene un nonce único del servidor**
   - El nonce tiene expiración de 10 minutos
   - Protege contra replay attacks

4. **Usuario firma un mensaje con su wallet**
   - Mensaje incluye: nombre ENS, nonce, y timestamp

5. **Backend valida la firma:**
   - Resuelve el nombre ENS a una dirección Ethereum
   - Verifica que la firma corresponde al propietario del ENS
   - Valida el nonce y timestamp

6. **Si la validación es exitosa:**
   - Se crea o recupera la cuenta del usuario
   - Se genera un JWT token
   - Usuario queda autenticado

### Seguridad

- **Nonces únicos**: Cada intento de login requiere un nonce nuevo
- **Expiración temporal**: Nonces y mensajes expiran después de 10 minutos
- **Validación de ENS**: Verificación directa en blockchain
- **Rate limiting**: Máximo 10 intentos de autenticación por 15 minutos
- **JWT seguro**: Tokens firmados con clave secreta

## 🔌 API Endpoints

### `GET /api/auth/nonce`
Obtiene un nonce único para el proceso de autenticación.

**Response:**
```json
{
  "nonce": "abc123...",
  "timestamp": 1234567890
}
```

### `POST /api/auth/ens-login`
Autentica un usuario usando ENS.

**Body:**
```json
{
  "ensName": "usuario.eth",
  "signature": "0x...",
  "nonce": "abc123...",
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "ensName": "usuario.eth",
    "address": "0x...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `GET /api/auth/verify`
Verifica un token JWT.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "ensName": "usuario.eth",
    "address": "0x...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- Ethers.js 6
- Axios

### Backend
- Node.js
- Express
- Ethers.js 6
- JSON Web Tokens
- Express Rate Limit

## 📝 Notas de Producción

⚠️ **Importante para producción:**

1. **Base de datos**: Reemplazar el almacenamiento en memoria por una base de datos real (PostgreSQL, MongoDB, etc.)
2. **JWT_SECRET**: Usar una clave secreta fuerte y única
3. **Redis**: Implementar almacenamiento de nonces en Redis para aplicaciones distribuidas
4. **HTTPS**: Siempre usar HTTPS en producción
5. **Variables de entorno**: Nunca commitear archivos `.env` con secretos reales
6. **Rate limiting**: Ajustar límites según necesidades
7. **Logging**: Implementar logging adecuado para auditoría

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles

## 🙏 Agradecimientos

- Ethereum Name Service (ENS)
- MetaMask y otras wallets por hacer Web3 accesible
- Comunidad de Ethereum

---

**Desarrollado con ❤️ para la Web3**

