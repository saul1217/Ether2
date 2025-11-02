# ⚠️ IMPORTANTE: Edita TU archivo authApi.ts

## 🎯 El Problema

Todavía estás haciendo **POST** en la línea 54 de **TU archivo `authApi.ts`**.

El archivo `CORRECCION_AUTHAPI.ts` es solo una **REFERENCIA**. NO es el archivo que causa el error.

## ✅ Lo Que Debes Hacer

### Paso 1: Abre TU archivo real

En tu proyecto, busca y abre:
```
authApi.ts
```

**NO** `CORRECCION_AUTHAPI.ts` (ese es solo de referencia)

### Paso 2: Ve a la línea 54

Busca la función `getNonce()` que debe verse así:

```typescript
async getNonce() {
  console.log('Attempting to get nonce from: https://ether2-7caz.onrender.com/api/auth/nonce');
  
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'POST',  // ❌❌❌ ESTA LÍNEA DEBE CAMBIARSE ❌❌❌
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // ... resto del código
}
```

### Paso 3: Cambia SOLO esta línea

**ENCUENTRA:**
```typescript
    method: 'POST',  // ❌
```

**CÁMBIALA POR:**
```typescript
    method: 'GET',   // ✅
```

### Paso 4: (Opcional) Elimina los headers

Los headers no son necesarios para GET, puedes eliminarlos:

**ANTES:**
```typescript
const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**DESPUÉS (más simple):**
```typescript
const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'GET'
});
```

O simplemente:
```typescript
const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce');
```

## 📝 Código Completo Corregido

Copia esto completo y reemplaza tu función `getNonce()`:

```typescript
async getNonce() {
  console.log('Attempting to get nonce from: https://ether2-7caz.onrender.com/api/auth/nonce');
  
  // ✅ CAMBIO: method: 'GET' (o simplemente omite method)
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'GET'  // ✅ CAMBIADO DE 'POST' A 'GET'
  });
  
  console.log('Nonce response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`Endpoint /api/auth/nonce no encontrado (${response.status}). Por favor verifica que el endpoint exista en la API.`);
  }
  
  const data = await response.json();
  
  return {
    nonce: String(data.nonce),
    timestamp: String(data.timestamp)
  };
}
```

## 🔍 Cómo Encontrar el Archivo Correcto

El error dice:
```
getNonce @ authApi.ts:54
```

Esto significa:
- **Archivo:** `authApi.ts`
- **Línea:** 54
- **Función:** `getNonce()`

Busca ese archivo en tu proyecto y edítalo ahí.

## ✅ Checklist

- [ ] Abrí **MI archivo** `authApi.ts` (no el de referencia)
- [ ] Encontré la función `getNonce()` alrededor de la línea 54
- [ ] Cambié `method: 'POST'` a `method: 'GET'`
- [ ] Guardé el archivo
- [ ] Recargué la aplicación en el navegador
- [ ] Probé hacer login de nuevo

## 🚨 Recordatorio

**NO edites `CORRECCION_AUTHAPI.ts`**

Ese archivo es solo una referencia/ejemplo. 

**SÍ edita `authApi.ts`** (el que está causando el error)

---

**El cambio es simple:** Solo cambia `POST` por `GET` en la línea 54 de tu `authApi.ts` real. 🎯

