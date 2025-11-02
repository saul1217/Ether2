# 📋 Resumen de Errores y Soluciones

## ❌ Error 1: 404 en `/api/auth/nonce`

**Error:**
```
POST https://ether2-7caz.onrender.com/api/auth/nonce
404 (Not Found)
```

**Causa:**
Estás haciendo **POST** pero el endpoint solo acepta **GET**.

**Solución:**
```javascript
// ❌ INCORRECTO
fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'POST'  // ❌ Esto causa 404
});

// ✅ CORRECTO
fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'GET'  // ✅ O simplemente omite method
});
```

---

## ❌ Error 2: MetaMask RPC Error

**Error:**
```
MetaMask - RPC Error: Internal JSON-RPC error.
```

**Causa:**
Generalmente causado por:
- MetaMask desbloqueado
- Red incorrecta (debe ser Ethereum Mainnet)
- Problemas de conexión

**Solución:**
1. Verifica que MetaMask esté desbloqueado
2. Asegúrate de estar en Ethereum Mainnet
3. Recarga la página
4. Reintenta la operación

---

## ❌ Error 3: Dirección no es propietaria del ENS

**Error:**
```
La dirección que firmó (0x...) no es propietaria del ENS saul12.eth. Owner: 0x...
```

**Causa:**
La wallet conectada no es la propietaria del ENS `saul12.eth`.

**Solución:**
1. Verifica en [ENS App](https://app.ens.domains) quién es el owner de `saul12.eth`
2. Conecta la wallet que es propietaria
3. O usa un ENS diferente que pertenezca a tu wallet actual

---

## ❌ Error 4: Mensaje incorrecto al firmar

**Error:**
```
Error en autenticación: La firma no corresponde...
```

**Causa:**
El mensaje que firmas no coincide con el que espera el backend.

**Solución:**
Usa este formato EXACTO:
```javascript
const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
```

**Debe ser exactamente:**
- `Autenticación ENS` (no otra frase)
- `\n\n` (dos saltos de línea)
- `Nombre: saul12.eth` (con el ENS name)
- `Nonce: abc123...` (string hexadecimal)
- `Timestamp: 1762027282108` (string)

---

## ✅ Código Correcto Completo

Usa el archivo `CODIGO_CORRECTO_FRONTEND.js` que contiene todo el código corregido.

### Checklist de Corrección:

- [ ] Cambiar `/api/auth/nonce` de POST a GET
- [ ] Usar mensaje exacto: `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`
- [ ] Nonce debe ser string hexadecimal (no array)
- [ ] Usar la wallet que es propietaria del ENS
- [ ] Verificar que MetaMask esté desbloqueado y en Mainnet

---

## 🔍 Endpoints Correctos

| Endpoint | Método | ¿Body? | Descripción |
|----------|--------|--------|-------------|
| `/api/auth/nonce` | **GET** | ❌ No | Obtener nonce único |
| `/api/auth/ens-login` | **POST** | ✅ Sí | Autenticar con ENS |
| `/api/auth/verify` | **GET** | ❌ No | Verificar token |

---

## 📝 Orden Correcto de Operaciones

1. **GET** `/api/auth/nonce` → Obtener nonce
2. Firmar mensaje con formato correcto
3. **POST** `/api/auth/ens-login` → Enviar firma y datos
4. Guardar token recibido

---

## 🎯 Pasos Inmediatos

1. **Copia el código de `CODIGO_CORRECTO_FRONTEND.js`**
2. **Reemplaza tu código actual con este**
3. **Prueba de nuevo**

El código en ese archivo tiene todas las correcciones aplicadas.

---

¡Con estos cambios deberían desaparecer todos los errores! 🎉

