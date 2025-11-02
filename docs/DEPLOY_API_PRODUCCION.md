# 🚀 Deploy del Backend como API Pública

Guía completa para desplegar el backend como una API que puede ser llamada desde cualquier página web.

## 📋 Checklist Pre-Deploy

### 1. Configurar Variables de Entorno

Crea o edita `backend/.env` con las siguientes variables:

```env
# Puerto del servidor (el servicio de hosting lo asignará automáticamente)
PORT=3001

# ⚠️ IMPORTANTE: Cambia esto por una clave secreta fuerte en producción
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres

# URL del RPC de Ethereum
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# 🌐 CORS: Dominios permitidos (SEPARADOS POR COMAS)
# Para permitir TODOS los dominios en producción (no recomendado para apps críticas):
ALLOWED_ORIGINS=*

# Para permitir dominios específicos:
# ALLOWED_ORIGINS=https://mi-pagina.com,https://www.mi-pagina.com,https://pagina-amigo.com

# Ambiente
NODE_ENV=production
```

### 2. Verificar CORS

El backend está configurado para:
- ✅ Permitir todos los orígenes si `ALLOWED_ORIGINS` está vacío o es `*`
- ✅ Permitir orígenes específicos si están configurados en `ALLOWED_ORIGINS`
- ✅ Funcionar correctamente en desarrollo y producción

### 3. Crear Archivo de Configuración del Servidor

Según la plataforma que uses, necesitarás diferentes archivos de configuración.

---

## 🌐 Opción 1: Render.com (Recomendado - Gratis)

### Pasos:

1. **Crear cuenta en [Render.com](https://render.com)**

2. **Crear nuevo Web Service:**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio Git (GitHub, GitLab, etc.)

3. **Configuración del servicio:**
   ```
   Name: ens-auth-api
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && node index.js
   ```

4. **Variables de Entorno en Render:**
   ```
   PORT=10000  (Render asignará automáticamente)
   JWT_SECRET=tu-clave-secreta-super-segura
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ALLOWED_ORIGINS=*
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click en "Create Web Service"
   - Render hará el deploy automáticamente
   - Tu API estará disponible en: `https://tu-servicio.onrender.com`

### ✅ Ventajas de Render:
- ✅ Gratis para comenzar
- ✅ HTTPS automático
- ✅ Auto-deploy desde Git
- ✅ Logs en tiempo real

---

## 🌐 Opción 2: Railway

### Pasos:

1. **Crear cuenta en [Railway](https://railway.app)**

2. **Nuevo Proyecto:**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

3. **Configuración:**
   - Railway detectará automáticamente que es Node.js
   - En "Settings" → "Deploy":
     - Root Directory: `backend`
     - Start Command: `node index.js`

4. **Variables de Entorno:**
   ```
   JWT_SECRET=tu-clave-secreta-super-segura
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ALLOWED_ORIGINS=*
   NODE_ENV=production
   ```
   (PORT se asigna automáticamente)

5. **Deploy:**
   - Railway hará el deploy automáticamente
   - Tu API estará en: `https://tu-proyecto.railway.app`

### ⚠️ Nota sobre Railway:
- El tier gratuito puede tener limitaciones de tiempo de respuesta
- Considera Render.com si Railway te da problemas

---

## 🌐 Opción 3: Heroku

### Pasos:

1. **Instalar Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Crear app:**
   ```bash
   cd backend
   heroku create tu-app-ens-auth
   ```

4. **Configurar variables:**
   ```bash
   heroku config:set JWT_SECRET=tu-clave-secreta-super-segura
   heroku config:set ETHEREUM_RPC_URL=https://eth.llamarpc.com
   heroku config:set ALLOWED_ORIGINS=*
   heroku config:set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Tu API estará en:** `https://tu-app-ens-auth.herokuapp.com`

---

## 🌐 Opción 4: DigitalOcean / AWS / Google Cloud

Estas opciones requieren configuración manual de servidores. Ver documentación específica de cada plataforma.

---

## ✅ Verificar que la API Funciona

Una vez desplegado, verifica que funciona:

### 1. Health Check:
```bash
curl https://tu-api.com/api/health
```

Debería responder:
```json
{
  "status": "ok",
  "service": "ENS Authentication API",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Obtener Nonce:
```bash
curl https://tu-api.com/api/auth/nonce
```

### 3. Probar desde el navegador:
Abre: `https://tu-api.com/api/health` en tu navegador

---

## 🔗 Usar la API desde otra Página Web

### Opción A: Usar desde React/Vue/etc.

```javascript
// Ejemplo con fetch
const API_URL = 'https://tu-api.com';

// Obtener nonce
const getNonce = async () => {
  const response = await fetch(`${API_URL}/api/auth/nonce`);
  const data = await response.json();
  return data;
};

// Login con ENS
const loginWithENS = async (ensName, signature, nonce, timestamp) => {
  const response = await fetch(`${API_URL}/api/auth/ens-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ensName,
      signature,
      nonce,
      timestamp
    })
  });
  return response.json();
};
```

### Opción B: Usar el Componente React

Si quieres usar el componente `LoginWithENS`, actualiza la URL de la API:

```jsx
// En LoginWithENS.jsx o tu componente
const API_URL = 'https://tu-api.com'; // Tu API desplegada

// Cambiar todas las llamadas de:
fetch('/api/auth/nonce')
// A:
fetch(`${API_URL}/api/auth/nonce`)
```

### Opción C: Configurar Proxy en Vite (Desarrollo)

Si estás desarrollando localmente y quieres usar la API remota:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://tu-api.com',
        changeOrigin: true
      }
    }
  }
}
```

---

## 🔐 Seguridad en Producción

### ⚠️ IMPORTANTE:

1. **JWT_SECRET:**
   - Debe ser una cadena larga y aleatoria
   - Genera una con: `openssl rand -hex 32`
   - NUNCA la compartas o la subas a Git

2. **CORS:**
   - Si tu API es pública, usa `ALLOWED_ORIGINS=*`
   - Si solo ciertos sitios deben acceder, especifica los dominios

3. **Rate Limiting:**
   - Ya está configurado (10 intentos por 15 minutos)
   - Puedes ajustarlo en `backend/index.js` si es necesario

4. **HTTPS:**
   - Todas las plataformas mencionadas proveen HTTPS automático
   - Nunca uses HTTP en producción

---

## 📊 Monitoreo

### Ver Logs:

- **Render:** Dashboard → Logs
- **Railway:** Deployments → View Logs
- **Heroku:** `heroku logs --tail`

### Endpoints Disponibles:

- `GET /` - Información del servicio
- `GET /api/health` - Health check
- `GET /api/auth/nonce` - Obtener nonce
- `POST /api/auth/ens-login` - Autenticar con ENS
- `GET /api/auth/verify` - Verificar token

---

## 🐛 Troubleshooting

### Error: "No permitido por CORS"
- Verifica que `ALLOWED_ORIGINS` está configurado correctamente
- Si es `*`, verifica que no hay espacios extras

### Error: "JWT_SECRET no está configurado"
- Asegúrate de que la variable de entorno `JWT_SECRET` está configurada en tu plataforma

### API no responde
- Verifica los logs de tu plataforma
- Verifica que el puerto está correctamente configurado
- Algunas plataformas asignan el puerto automáticamente (usa `process.env.PORT`)

---

## 📝 Resumen Rápido

1. ✅ Configura `backend/.env` con todas las variables
2. ✅ Elige una plataforma (Render.com recomendado)
3. ✅ Conecta tu repositorio Git
4. ✅ Configura las variables de entorno en la plataforma
5. ✅ Deploy automático
6. ✅ Verifica con `/api/health`
7. ✅ Usa la URL de tu API en otras páginas web

¡Tu API estará lista para ser usada desde cualquier página web! 🌐

