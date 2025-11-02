# 🚀 Guía Paso a Paso: Desplegar en Render.com

**Render.com es GRATIS y permite desplegar Node.js sin limitaciones.** Aquí está el paso a paso detallado:

---

## Paso 1: Crear Cuenta

1. Ve a [render.com](https://render.com)
2. Click en **"Get Started for Free"**
3. Elige **"Sign up with GitHub"** (o usa email)
4. Completa el registro

---

## Paso 2: Crear Nuevo Servicio Web

1. En el dashboard, click en **"New +"** (esquina superior derecha)
2. Selecciona **"Web Service"**
3. Conecta tu repositorio:
   - Si ya conectaste GitHub, selecciona tu repositorio
   - Si no, click en "Connect GitHub" y autoriza
   - Selecciona el repositorio que contiene tu código

---

## Paso 3: Configurar el Servicio

### Información Básica:

```
Name: ens-auth-api
(El nombre que quieras para tu servicio)
```

### Configuración de Build y Deploy:

**Environment:** Selecciona **"Node"**

**Build Command:**
```
cd server && npm install
```

**Start Command:**
```
cd server && node index.js
```

### Plan:

Selecciona **"Free"** (es gratis para siempre)

---

## Paso 4: Variables de Entorno

1. En la sección **"Environment"**, agrega estas variables:

   ```
   PORT=10000
   ```
   *(Render asigna el puerto automáticamente, pero puedes usar 10000)*

   ```
   JWT_SECRET=tu-clave-super-secreta-aqui
   ```
   *(Cámbiala por una clave única y segura)*

   ```
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ```

   ```
   ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
   ```
   *(Reemplaza con los dominios reales o déjalo vacío para desarrollo)*

   ```
   NODE_ENV=production
   ```

2. Para cada variable:
   - Click en **"Add Environment Variable"**
   - Ingresa el nombre (ej: `PORT`)
   - Ingresa el valor (ej: `10000`)
   - Click **"Save Changes"**

---

## Paso 5: Desplegar

1. Revisa que toda la configuración esté correcta
2. Click en **"Create Web Service"**
3. Espera 2-3 minutos mientras Render:
   - Instala las dependencias
   - Compila tu aplicación
   - Despliega el servicio

4. Verás el progreso en la pantalla

---

## Paso 6: Obtener tu URL

Una vez desplegado:

1. Verás una sección que dice **"Your service is live at:"**
2. Tu URL será algo como: `https://ens-auth-api.onrender.com`
3. **Tu API estará en:** `https://ens-auth-api.onrender.com/api`

**¡Anota esta URL!** La necesitarás para compartir con tu amigo.

---

## Paso 7: Probar que Funciona

### Opción A: Desde el Navegador

Abre esta URL en tu navegador:
```
https://ens-auth-api.onrender.com/api/auth/nonce
```

Deberías ver algo como:
```json
{
  "nonce": "abc123...",
  "timestamp": "1762003558136"
}
```

### Opción B: Desde la Consola del Navegador

```javascript
fetch('https://ens-auth-api.onrender.com/api/auth/nonce')
  .then(r => r.json())
  .then(console.log);
```

Si ves el JSON con nonce y timestamp, ¡funciona! ✅

---

## ⚙️ Configuración Adicional (Opcional)

### Cambiar el Nombre de la URL

1. Ve a **"Settings"** en tu servicio
2. Busca **"Custom Domain"**
3. Puedes agregar tu propio dominio si tienes uno

### Ver Logs

1. Click en **"Logs"** en el menú
2. Verás todos los logs del servidor en tiempo real
3. Útil para debugging

### Auto-Deploy

- Por defecto, cada vez que haces push a GitHub, Render despliega automáticamente
- Puedes desactivarlo en Settings → "Auto-Deploy"

---

## 🔧 Solución de Problemas

### El servicio no inicia

1. Revisa los logs en la pestaña "Logs"
2. Verifica que `Start Command` sea: `cd server && node index.js`
3. Verifica que las variables de entorno estén correctas

### Error "Module not found"

1. Verifica que `Build Command` sea: `cd server && npm install`
2. Asegúrate de que `package.json` esté en la carpeta `server/`

### Error de CORS

1. Verifica que `ALLOWED_ORIGINS` incluya tu dominio
2. O déjalo vacío para permitir todos (solo en desarrollo)

---

## 📤 Compartir con tu Amigo

Una vez desplegado, comparte:

1. **La URL de tu API:** `https://ens-auth-api.onrender.com/api`
2. **El archivo `API_DOCS.md`** (documentación de endpoints)
3. **El componente `LoginWithENSRemote.jsx`** o instrucciones de cómo usarlo

---

## 💰 Costos

**Render.com es GRATIS** para:
- ✅ 1 servicio web
- ✅ Deploy automático desde GitHub
- ✅ HTTPS automático
- ✅ Logs y métricas básicas

**Límites del plan gratuito:**
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera petición después de dormir tarda ~30 segundos (spin-up)
- Después funciona normalmente

**Para eliminar el sleep (opcional):**
- Puedes hacer una petición cada 10 minutos automáticamente
- O pagar $7/mes para mantenerlo siempre activo

---

## ✅ Checklist Final

- [ ] Cuenta creada en Render.com
- [ ] Repositorio conectado
- [ ] Servicio web creado
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] URL obtenida y probada
- [ ] Compartido con tu amigo

---

¡Listo! Tu API está desplegada y lista para usar. 🎉

