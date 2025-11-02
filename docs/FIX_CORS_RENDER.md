# 🔧 Solucionar CORS en Render.com

## ⚠️ Problema

Tu API en `https://ether2-7caz.onrender.com` está bloqueando peticiones desde `https://web-prueba4.vercel.app` por CORS.

## ✅ Solución Rápida

### 1. Ir a Render.com Dashboard

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Encuentra tu servicio `ether2-7caz` (o como se llame)
3. Click en "Environment" (en el menú lateral)

### 2. Agregar Variable de Entorno

Agrega o modifica la variable:

**Variable:** `ALLOWED_ORIGINS`  
**Valor:** `https://web-prueba4.vercel.app`

**O si quieres permitir múltiples dominios:**
**Valor:** `https://web-prueba4.vercel.app,https://www.tu-otro-dominio.com`

**O para permitir TODOS los dominios (menos seguro pero más fácil):**
**Valor:** `*`

### 3. Guardar y Redeploy

1. Click "Save Changes"
2. Render redeployará automáticamente
3. Espera a que termine el deploy (2-3 minutos)

### 4. Verificar

Después del redeploy, prueba desde tu página:
- Ve a `https://web-prueba4.vercel.app`
- Abre la consola del navegador (F12)
- Intenta hacer login

Deberías ver en los logs de Render logs que muestran:
```
[CORS] Request desde origin: https://web-prueba4.vercel.app
[CORS] ✅ Permitido
```

## 🔍 Verificar Logs en Render

1. En Render, ve a "Logs"
2. Busca líneas que empiecen con `[CORS]`
3. Verifica que muestre "✅ Permitido"

## 🐛 Si Sigue Fallando

### Error 500 (Internal Server Error)

Si también ves un error 500, verifica:

1. **JWT_SECRET está configurado:**
   - Variable: `JWT_SECRET`
   - Debe tener un valor (mínimo 32 caracteres)

2. **Verifica los logs completos:**
   - Busca líneas con `❌ Error`
   - Copia el error completo para diagnosticar

### CORS Todavía Bloqueado

1. Verifica que no hay espacios extras:
   - ✅ Correcto: `https://web-prueba4.vercel.app`
   - ❌ Incorrecto: ` https://web-prueba4.vercel.app ` (con espacios)

2. Verifica que el valor es exacto (case-sensitive en algunos casos)

3. Si usas `*`, verifica que no hay otros caracteres

## 📝 Configuración Recomendada para Producción

```env
ALLOWED_ORIGINS=https://web-prueba4.vercel.app
NODE_ENV=production
JWT_SECRET=tu-clave-secreta-super-larga-y-aleatoria
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

## 🚀 Paso a Paso Visual

1. **Render Dashboard** → Tu servicio
2. **Environment** (menú izquierdo)
3. **Add Environment Variable**
4. Key: `ALLOWED_ORIGINS`
5. Value: `https://web-prueba4.vercel.app`
6. **Save Changes**
7. Espera el redeploy (verás "Live" cuando termine)
8. Prueba desde tu página web

---

¡Después del redeploy debería funcionar! 🎉

