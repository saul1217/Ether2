# 🔧 Configurar para Desarrollo Local

## ✅ Configuración Rápida

### Paso 1: Asegúrate de que el Backend Esté Corriendo

```bash
# Terminal 1
cd server
npm run dev
```

**Debe mostrar:**
```
🚀 Servidor corriendo en http://localhost:3001
```

### Paso 2: Asegúrate de que el Frontend Esté Corriendo

```bash
# Terminal 2
cd client
npm run dev
```

**Debe mostrar:**
```
➜  Local:   http://localhost:3000/
```

### Paso 3: Configura el Código Frontend para Usar Local

Si estás usando `CODIGO_FRONTEND_CORRECTO.ts`, el código ya está configurado para detectar automáticamente si estás en local y usar `http://localhost:3001`.

**O puedes configurarlo manualmente:**

```typescript
import AuthApiService from './CODIGO_FRONTEND_CORRECTO';

// Para desarrollo local
const authService = new AuthApiService({
  apiUrl: 'http://localhost:3001',  // ← URL del backend local
  enableDebug: true                  // ← Activar logs para debugging
});

// Para producción/remoto
// const authService = new AuthApiService({
//   apiUrl: 'https://ether2-7caz.onrender.com',
//   enableDebug: false
// });
```

### Paso 4: Usar el Servicio

```typescript
// En tu componente o función de login
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Obtener ENS (o usar el que el usuario ingrese)
let ensName = await provider.lookupAddress(await signer.getAddress());
if (!ensName) {
  ensName = 'saul12.eth'; // O pedir al usuario
}

// Login
const result = await authService.loginWithENS(ensName, signer);

// Guardar token
localStorage.setItem('ensAuthToken', result.token);
```

## 🧪 Prueba Rápida

### 1. Verificar que el Backend Respuesta

Abre en el navegador:
```
http://localhost:3001/api/health
```

**Debe retornar JSON con status: "ok"**

### 2. Ejecutar Script de Prueba

Abre la consola del navegador (F12) en `http://localhost:3000` y ejecuta el contenido de `PRUEBA_RAPIDA_LOCAL.js`.

### 3. Probar Login

1. Conecta MetaMask
2. Ingresa tu ENS (ej: `saul12.eth`)
3. Haz login
4. Revisa los logs en:
   - **Consola del navegador** (F12) - logs del frontend
   - **Terminal del servidor** - logs del backend

## 🔍 Comparar Logs

### Logs del Frontend (Consola del Navegador)

Deberías ver:
```
🔍 Obteniendo nonce de: http://localhost:3001/api/auth/nonce
✅ Nonce recibido: { nonce: "abc123...", ... }
📝 Mensaje a firmar: Autenticación ENS\n\nNombre: saul12.eth\n...
✍️ Firmando mensaje con MetaMask...
✅ Firma obtenida: 0x...
📤 Enviando payload a ens-login: { ... }
```

### Logs del Backend (Terminal del Servidor)

Deberías ver:
```
[ENS Validator] 📝 Mensaje usado para verificar:
  - Texto completo: "Autenticación ENS\n\nNombre: saul12.eth\n..."
  - Longitud: ...
  - Nonce: abc123...
[ENS Validator] ✅ Dirección recuperada de la firma: 0x...
[ENS Validator] Owner del ENS (checksummed): 0x...
[ENS Validator] Validación exitosa - isOwner: true
```

### ⚠️ Si los Mensajes NO Coinciden

**Frontend muestra:**
```
Mensaje: "Please sign this message..."
```

**Backend muestra:**
```
Mensaje: "Autenticación ENS\n\nNombre: ..."
```

**Solución:** El frontend está usando el mensaje incorrecto. Usa el código de `CODIGO_FRONTEND_CORRECTO.ts`.

## ✅ Checklist

- [ ] Backend corriendo en `http://localhost:3001`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] `http://localhost:3001/api/health` responde
- [ ] El código frontend usa `apiUrl: 'http://localhost:3001'`
- [ ] Logs del frontend muestran el mensaje correcto
- [ ] Logs del backend muestran el mensaje correcto
- [ ] Ambos mensajes son idénticos

## 🐛 Si Sigue Sin Funcionar

1. **Comparte los logs completos:**
   - Logs del frontend (consola del navegador)
   - Logs del backend (terminal del servidor)

2. **Verifica el error específico:**
   - ¿Qué mensaje de error ves?
   - ¿En qué paso falla? (obtener nonce, firmar, enviar login)

3. **Prueba el script de prueba:**
   - Ejecuta `PRUEBA_RAPIDA_LOCAL.js` en la consola
   - Comparte los resultados

---

**El código ya está configurado para funcionar en local automáticamente. Solo asegúrate de que ambos servidores estén corriendo.** ✅

