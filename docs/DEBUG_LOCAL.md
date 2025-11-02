# 🔧 Debug: Problema en Local

## 🎯 Pasos para Verificar

### Paso 1: Verificar que el Servidor Esté Corriendo

```bash
# Terminal 1: Backend
cd server
npm run dev
```

**Debe mostrar:**
```
🚀 Servidor corriendo en http://localhost:3001
📝 Endpoints disponibles:
   GET  /                      - Información del servicio
   GET  /api/health            - Health check
   GET  /api/auth/nonce        - Obtener nonce
   POST /api/auth/ens-login    - Autenticar con ENS
   GET  /api/auth/verify       - Verificar token
```

### Paso 2: Verificar que el Cliente Esté Corriendo

```bash
# Terminal 2: Frontend
cd client
npm run dev
```

**Debe mostrar:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:3000/
```

### Paso 3: Verificar Conexión Backend

Abre en el navegador:
```
http://localhost:3001/api/health
```

**Debe retornar:**
```json
{
  "status": "ok",
  "service": "ENS Authentication API",
  "timestamp": "..."
}
```

### Paso 4: Verificar Proxy de Vite

El frontend usa rutas relativas `/api/auth/nonce` que Vite debe proxear a `localhost:3001`.

**Verifica `client/vite.config.js`:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

### Paso 5: Verificar que el Frontend Use el Backend Local

Si estás usando tu propio código frontend, asegúrate de que apunte a:

```typescript
// ✅ Para desarrollo local
const apiUrl = 'http://localhost:3001';

// ❌ NO uses la URL remota en local
// const apiUrl = 'https://ether2-7caz.onrender.com';
```

## 🐛 Errores Comunes

### Error 1: "Cannot GET /api/auth/nonce"

**Causa:** El proxy no está funcionando o el servidor no está corriendo.

**Solución:**
1. Verifica que el servidor esté en el puerto 3001
2. Verifica que `vite.config.js` tenga el proxy configurado
3. Reinicia ambos servidores

### Error 2: CORS Error

**Causa:** El frontend no puede acceder al backend.

**Solución:**
1. El backend ya permite todos los orígenes si `ALLOWED_ORIGINS` está vacío
2. Verifica que ambos estén corriendo
3. Verifica que el proxy esté configurado

### Error 3: "Nonce inválido o expirado"

**Causa:** Estás usando un nonce viejo o de otro servidor.

**Solución:**
1. Asegúrate de obtener el nonce del mismo servidor donde haces login
2. No reutilices nonces
3. El nonce debe obtenerse justo antes de firmar

### Error 4: "La dirección que firmó no es propietaria del ENS"

**Causa:** El mensaje que firmas NO coincide con el que el backend verifica.

**Solución:** Ver siguiente sección.

## 🔍 Verificar el Mensaje

### En el Frontend (Consola del Navegador)

Agrega estos logs en tu código:

```typescript
const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

console.log('🔍 FRONTEND - Mensaje a firmar:');
console.log(JSON.stringify(message));
console.log('🔍 FRONTEND - Longitud:', message.length);
console.log('🔍 FRONTEND - Nonce:', nonce);
console.log('🔍 FRONTEND - Nonce tipo:', typeof nonce);
```

### En el Backend (Terminal del Servidor)

Busca en los logs del servidor:

```
[ENS Validator] 📝 Mensaje usado para verificar:
  - Texto completo: ...
  - Longitud: ...
  - Nonce: ...
```

### Comparar Ambos

Los mensajes deben ser **exactamente iguales**, carácter por carácter.

## ✅ Checklist Completo

- [ ] Servidor backend corriendo en puerto 3001
- [ ] Cliente frontend corriendo en puerto 3000
- [ ] `http://localhost:3001/api/health` responde
- [ ] El código frontend usa `http://localhost:3001` (no la URL remota)
- [ ] `vite.config.js` tiene el proxy configurado
- [ ] El mensaje del frontend coincide con el del backend
- [ ] El nonce es string hexadecimal (no array)
- [ ] El timestamp es string (no número)

## 🧪 Prueba Rápida

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Probar conexión con backend
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Probar obtener nonce
fetch('http://localhost:3001/api/auth/nonce')
  .then(r => r.json())
  .then(data => {
    console.log('Nonce recibido:', data);
    console.log('Tipo de nonce:', typeof data.nonce);
    console.log('Es hexadecimal?:', /^[0-9a-f]+$/i.test(data.nonce));
  })
  .catch(console.error);
```

Si estos funcionan, el problema está en el formato del mensaje o la firma.

---

**Verifica cada punto del checklist y comparte qué error específico estás viendo.** 🔍

