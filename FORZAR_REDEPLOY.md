# 🔄 Forzar Redeploy en Render

## 🎯 El Problema

El endpoint existe en el código pero puede que no esté desplegado en Render.

## ✅ Solución: Forzar Nuevo Deploy

### Paso 1: Verificar Estado Actual

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Selecciona tu servicio "Ether2"
3. Ve a **"Logs"**
4. Busca estas líneas:
   ```
   🚀 Servidor corriendo en http://localhost:3001
   📝 Endpoints disponibles:
      GET  /api/auth/nonce        - Obtener nonce
   ```

   Si NO las ves, el código no está desplegado o está desactualizado.

### Paso 2: Forzar Nuevo Deploy

**Opción A: Hacer un Cambio Pequeño (Recomendado)**

1. Abre `server/index.js`
2. Agrega un comentario o cambia un comentario existente:
   ```javascript
   // Endpoint para obtener un nonce único - v2
   app.get('/api/auth/nonce', (req, res) => {
   ```

3. Guarda el archivo

4. Haz commit y push:
   ```bash
   git add server/index.js
   git commit -m "Forzar redeploy - verificar endpoint nonce"
   git push
   ```

5. Render detectará el cambio y redesplegará automáticamente

**Opción B: Manual desde Render**

1. Ve a Render dashboard
2. Selecciona tu servicio
3. Click en **"Manual Deploy"** o **"Redeploy"**
4. Selecciona el commit más reciente
5. Click en **"Deploy"**

### Paso 3: Verificar el Deploy

1. En Render, ve a **"Events"** o **"Logs"**
2. Espera a que termine el deploy (2-3 minutos)
3. Busca en los logs:
   ```
   🚀 Servidor corriendo en...
   📝 Endpoints disponibles:
      GET  /api/auth/nonce
   ```

### Paso 4: Probar el Endpoint

Una vez que termine el deploy, prueba en el navegador:
```
https://ether2-7caz.onrender.com/api/auth/nonce
```

Deberías ver JSON con nonce y timestamp.

## 🔍 Verificar Configuración en Render

### Settings → Build & Deploy

**Start Command debe ser:**
```
cd server && node index.js
```

**Build Command debe ser:**
```
cd server && npm install
```

**Root Directory:** Debe estar vacío o ser `.`

### Settings → Environment

Verifica estas variables (si las configuraste):
- `PORT` (opcional, Render asigna automáticamente)
- `JWT_SECRET`
- `ETHEREUM_RPC_URL`
- `ALLOWED_ORIGINS` (opcional)

## 📊 Verificar Logs en Tiempo Real

1. En Render, click en **"Logs"**
2. Deberías ver algo como:
   ```
   Nov 1 12:26:09 PM 🚀 Servidor corriendo en http://localhost:3001
   Nov 1 12:26:09 PM 📝 Endpoints disponibles:
   Nov 1 12:26:09 PM    GET  /                      - Información del servicio
   Nov 1 12:26:09 PM    GET  /api/health            - Health check
   Nov 1 12:26:09 PM    GET  /api/auth/nonce        - Obtener nonce
   Nov 1 12:26:09 PM    POST /api/auth/ens-login    - Autenticar con ENS
   Nov 1 12:26:09 PM    GET  /api/auth/verify       - Verificar token
   ```

Si ves estos mensajes ✅, el endpoint está disponible.

Si NO los ves ❌, el código no está desplegado o hay un error.

## 🚨 Si Hay Errores en los Logs

Revisa los logs de Render para ver si hay errores de:
- Dependencias faltantes
- Errores de sintaxis
- Variables de entorno incorrectas
- Puerto incorrecto

## ✅ Checklist Final

- [ ] El código local tiene el endpoint (línea 65 de server/index.js)
- [ ] Hice `git push` del código
- [ ] Render está redesplegando automáticamente
- [ ] Los logs muestran "Endpoints disponibles"
- [ ] Probé `/api/auth/nonce` en el navegador y funciona
- [ ] El servicio no está dormido (o esperé 30 segundos)

---

**Una vez que Render redespliegue, el endpoint debería estar disponible. Verifica los logs para confirmarlo.** 🚀

