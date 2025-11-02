# ✅ Verificación Rápida de CORS

## 🔍 Para tu caso específico

Tu página: `https://web-prueba4.vercel.app`  
Tu API: `https://ether2-7caz.onrender.com`

## 📋 Checklist

### En Render.com:

1. ✅ Ve a tu servicio en Render
2. ✅ Click en "Environment"
3. ✅ Verifica que existe `ALLOWED_ORIGINS`
4. ✅ El valor debe ser exactamente: `https://web-prueba4.vercel.app`
5. ✅ **Sin espacios** al inicio o final
6. ✅ Guarda los cambios
7. ✅ Espera el redeploy (verás "Building..." luego "Live")

### Verificar en los Logs:

Después del redeploy, cuando alguien acceda desde tu página, deberías ver:

```
[CORS] Request desde origin: https://web-prueba4.vercel.app
[CORS] ALLOWED_ORIGINS configurado: https://web-prueba4.vercel.app
[CORS] allowedOrigins array: [ 'https://web-prueba4.vercel.app' ]
[CORS] ✅ Permitido (está en la lista)
```

Si ves `❌ Origen rechazado`, entonces:
- El dominio no coincide exactamente
- Hay espacios extras
- La variable no está configurada correctamente

## 🚨 Solución Rápida

Si quieres permitir TODOS los dominios (para pruebas):

1. En Render.com → Environment
2. Cambia `ALLOWED_ORIGINS` a: `*`
3. Guarda
4. Redeploy

Esto permitirá que cualquier dominio acceda a tu API.

---

## 🧪 Probar Manualmente

Después de configurar, prueba desde la consola del navegador en tu página:

```javascript
fetch('https://ether2-7caz.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ API funciona:', data))
  .catch(err => console.error('❌ Error:', err));
```

Si funciona, verás `{status: "ok", service: "ENS Authentication API", ...}`

