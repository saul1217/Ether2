# 🔧 Solución Inmediata: CORS para tu Página en Vercel

## 🎯 Tu Situación

- **Tu API:** `https://ether2-7caz.onrender.com`
- **Tu Página:** `https://web-prueba4.vercel.app`
- **Error:** CORS bloqueando las peticiones

## ✅ Solución Paso a Paso

### Paso 1: Configurar en Render.com

1. **Ve a [dashboard.render.com](https://dashboard.render.com)**
2. **Encuentra tu servicio** (el que tiene `ether2-7caz` en la URL)
3. **Click en "Environment"** (menú izquierdo)

### Paso 2: Agregar/Modificar Variable de Entorno

**Opción A: Permitir solo tu dominio de Vercel (Recomendado)**

1. Busca la variable `ALLOWED_ORIGINS` o crea una nueva
2. **Key:** `ALLOWED_ORIGINS`
3. **Value:** `https://web-prueba4.vercel.app`
4. **⚠️ IMPORTANTE:** Sin espacios, exactamente así

**Opción B: Permitir todos los dominios (Más fácil para pruebas)**

1. **Key:** `ALLOWED_ORIGINS`
2. **Value:** `*`
3. Esto permitirá que cualquier dominio acceda (útil para desarrollo)

### Paso 3: Verificar Otras Variables

Asegúrate de que también tienes:

- **`JWT_SECRET`** = (alguna clave secreta larga)
- **`NODE_ENV`** = `production`
- **`ETHEREUM_RPC_URL`** = `https://eth.llamarpc.com`

### Paso 4: Guardar y Esperar Redeploy

1. Click **"Save Changes"**
2. Render redeployará automáticamente
3. Espera 2-3 minutos hasta que veas **"Live"** en verde

### Paso 5: Verificar Logs

1. Ve a **"Logs"** en Render
2. Espera una petición desde tu página
3. Deberías ver:

```
[CORS] Request desde origin: https://web-prueba4.vercel.app
[CORS] ALLOWED_ORIGINS configurado: https://web-prueba4.vercel.app
[CORS] ✅ Permitido (está en la lista)
```

Si ves `❌ Origen rechazado`, entonces el dominio no coincide exactamente.

---

## 🧪 Probar Después del Redeploy

Abre la consola del navegador en tu página (`https://web-prueba4.vercel.app`) y ejecuta:

```javascript
fetch('https://ether2-7caz.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Funciona!', data))
  .catch(err => console.error('❌ Error:', err));
```

Si funciona, verás: `{status: "ok", service: "ENS Authentication API", ...}`

---

## 🐛 Si También Hay Error 500

El error 500 significa que el servidor está fallando. Verifica:

1. **En los logs de Render**, busca líneas con `❌ Error`
2. **JWT_SECRET** debe estar configurado (mínimo 32 caracteres)
3. Copia el error completo de los logs para diagnosticar

---

## 📝 Resumen Rápido

1. Render.com → Tu servicio → Environment
2. `ALLOWED_ORIGINS` = `https://web-prueba4.vercel.app` (o `*`)
3. Save Changes
4. Espera redeploy
5. Prueba desde tu página

¡Debería funcionar después del redeploy! 🚀

