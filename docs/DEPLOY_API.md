# 🚀 Guía para Exponer tu API Públicamente

Esta guía te ayudará a configurar tu backend para que otros puedan usarlo como servicio remoto.

## 🎯 Objetivo

Hacer que tu backend de autenticación ENS sea accesible desde cualquier página web (tu página, la de tu amigo, etc.)

---

## 📋 Paso 1: Configurar CORS

Ya está configurado en `server/index.js`, pero puedes personalizarlo:

### Para Desarrollo Local

Ya está listo. El código permite cualquier origen en desarrollo.

### Para Producción

**Ubicación del archivo `.env`:** 
- Está en la carpeta `server/` → `server/.env`
- Si no existe, créalo copiando desde `env.example` (que está en la raíz del proyecto)

**Edita `server/.env`:**

```env
# Lista de dominios permitidos (separados por comas)
ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-de-tu-amigo.com,https://otro-sitio.com

# O deja vacío para permitir todos (menos seguro, solo en desarrollo)
# ALLOWED_ORIGINS=
```

**Nota:** El archivo `.env` está en `.gitignore` y no se sube al repositorio por seguridad.

---

## 📋 Paso 2: Desplegar el Servidor

> ⚠️ **Nota:** Railway puede tener limitaciones en planes gratuitos. Si no puedes desplegar, ve a **`DEPLOY_ALTERNATIVAS.md`** para otras opciones gratuitas.

### Opción A: Render.com (Gratis, Sin Limitaciones) ⭐ RECOMENDADO

1. Ve a [render.com](https://render.com)
2. Sign up con GitHub (gratis)
3. Click "New +" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Configuración:
   ```
   Name: ens-auth-api
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && node index.js
   ```
6. Agrega variables de entorno en "Environment":
   ```
   PORT=10000
   JWT_SECRET=tu-clave-secreta
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
   NODE_ENV=production
   ```
7. Click "Create Web Service"
8. Espera 2-3 minutos
9. Tu API estará en: `https://ens-auth-api.onrender.com/api`

### Opción B: Railway (Gratis, pero Puede Tener Limitaciones)

⚠️ **Nota:** Railway puede limitar cuentas gratuitas a solo bases de datos. Si ves "Limited Access", usa otra opción.

1. Ve a [railway.app](https://railway.app)
2. Sign up con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Conecta tu repositorio
5. Railway detecta Node.js automáticamente
6. Agrega variables de entorno en "Variables":
   ```
   PORT=3001
   JWT_SECRET=tu-clave-secreta
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
   ```
7. Railway te da una URL tipo: `https://tu-proyecto.railway.app`
8. Tu API estará en: `https://tu-proyecto.railway.app/api`

### 🚀 Más Opciones

Si ninguna de estas funciona, ver:
- **`GUIA_RENDER.md`** - Guía paso a paso detallada para Render.com
- **`DEPLOY_ALTERNATIVAS.md`** - Otras opciones (Cyclic.sh, Fly.io, Replit, Vercel, etc.)

### Opción B: Heroku

1. Instala Heroku CLI
2. Login: `heroku login`
3. Crea app: `heroku create tu-app-ens-auth`
4. Despliega: `git push heroku main`
5. Configura variables:
   ```bash
   heroku config:set JWT_SECRET=tu-clave
   heroku config:set ALLOWED_ORIGINS=https://tu-pagina.com
   ```
6. Tu API: `https://tu-app-ens-auth.herokuapp.com/api`

### Opción C: Vercel (Para Backend)

```bash
npm i -g vercel
vercel
# Sigue las instrucciones
# Tu API: https://tu-proyecto.vercel.app/api
```

### Opción D: DigitalOcean / AWS / Google Cloud

1. Crea una VM/Droplet
2. Instala Node.js
3. Clona tu proyecto
4. Instala dependencias
5. Usa PM2 para mantenerlo corriendo:
   ```bash
   npm install -g pm2
   cd server
   pm2 start index.js --name ens-auth-api
   pm2 save
   pm2 startup
   ```
6. Configura Nginx como reverse proxy (opcional)
7. Tu API: `http://tu-ip:3001/api` o con dominio

---

## 📋 Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en tu servidor (o usa las variables del servicio):

```env
PORT=3001
JWT_SECRET=genera-una-clave-muy-segura-aqui
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com

# Opcional: API Keys para controlar acceso
ENABLE_API_KEYS=false
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📋 Paso 4: Probar que Funciona

### Desde tu navegador

Abre la consola y prueba:

```javascript
// Probar endpoint de nonce
fetch('https://tu-api.com/api/auth/nonce')
  .then(r => r.json())
  .then(console.log);
```

Deberías ver:
```json
{
  "nonce": "abc123...",
  "timestamp": "1762003558136"
}
```

### Desde Postman o curl

```bash
curl https://tu-api.com/api/auth/nonce
```

---

## 📋 Paso 5: Compartir con tu Amigo

### Información que necesitas darle:

1. **URL de tu API:**
   ```
   https://tu-proyecto.railway.app/api
   ```

2. **Documentación:**
   - Comparte `API_DOCS.md`
   - O simplemente la URL base

3. **Ejemplo de uso:**
   ```javascript
   const API_URL = 'https://tu-proyecto.railway.app/api';
   
   // Obtener nonce
   const { nonce, timestamp } = await (
     await fetch(`${API_URL}/auth/nonce`)
   ).json();
   
   // Login
   const response = await fetch(`${API_URL}/auth/ens-login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ ensName, signature, nonce, timestamp })
   });
   ```

---

## 🔒 Seguridad Adicional (Opcional)

### Agregar API Keys

Si quieres controlar quién puede usar tu API:

1. **Edita `server/index.js`** (después de las líneas de CORS):

```javascript
// Sistema de API Keys (opcional)
const API_KEYS = process.env.API_KEYS 
  ? new Set(process.env.API_KEYS.split(',').map(k => k.trim()))
  : null; // null = desactivado

// Middleware de API Key (solo si está habilitado)
if (API_KEYS) {
  app.use('/api/auth', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !API_KEYS.has(apiKey)) {
      return res.status(403).json({ 
        error: 'API key requerida o inválida. Agrega header: X-API-Key' 
      });
    }
    next();
  });
}
```

2. **Agrega a `.env`:**
```env
API_KEYS=clave-para-tu-amigo,otra-clave,clave-para-otro-sitio
```

3. **Tu amigo usa:**
```javascript
fetch(`${API_URL}/auth/nonce`, {
  headers: {
    'X-API-Key': 'clave-para-tu-amigo'
  }
});
```

---

## 📊 Monitoreo (Opcional)

### Logs

Revisa los logs de tu servicio:
- Railway: Dashboard → Logs
- Heroku: `heroku logs --tail`
- PM2: `pm2 logs ens-auth-api`

### Health Check Endpoint

Agrega este endpoint para verificar que el servidor está funcionando:

```javascript
// En server/index.js
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ENS Auth API'
  });
});
```

Luego puedes verificar: `https://tu-api.com/api/health`

---

## 🐛 Troubleshooting

### CORS Error

**Error:** `Access-Control-Allow-Origin`

**Solución:**
- Verifica que el dominio esté en `ALLOWED_ORIGINS`
- En desarrollo, el código permite cualquier origen automáticamente

### 404 Not Found

**Error:** No encuentra los endpoints

**Solución:**
- Verifica que la URL base termine en `/api`
- Ejemplo: `https://tu-api.com/api/auth/nonce` (no `/api/api/auth/nonce`)

### Rate Limit

**Error:** Demasiados intentos

**Solución:**
- Espera 15 minutos
- O ajusta el rate limit en `server/index.js`

---

## ✅ Checklist Final

- [ ] Servidor desplegado y accesible
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado (en producción)
- [ ] Probado desde otro dominio
- [ ] Documentación compartida (`API_DOCS.md`)
- [ ] URL de la API compartida con tu amigo

---

## 📞 Siguiente Paso

Una vez desplegado, comparte con tu amigo:
1. La URL de tu API: `https://tu-api.com/api`
2. El archivo `API_DOCS.md`
3. El ejemplo de código de `API_DOCS.md`

¡Tu API está lista para ser usada por múltiples sitios web! 🎉

