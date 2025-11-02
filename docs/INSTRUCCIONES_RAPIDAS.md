# ⚡ Instrucciones Rápidas: Corregir Error 404

## 🎯 El Problema

Tu archivo `authApi.ts` línea 54 está haciendo **POST** cuando debe ser **GET**.

## ✅ Solución en 3 Pasos

### Paso 1: Abre `authApi.ts`

Busca el archivo `authApi.ts` en tu proyecto.

### Paso 2: Busca la función `getNonce()`

Debe estar alrededor de la línea 54. Busca algo como:

```typescript
async getNonce() {
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'POST',  // ❌ ESTA LÍNEA ESTÁ MAL
```

### Paso 3: Cambia POST a GET

**Cambia:**
```typescript
method: 'POST',  // ❌
```

**Por:**
```typescript
method: 'GET',   // ✅
```

O simplemente **elimina** la línea `method: 'POST',` completamente (GET es el default).

## 📝 Ejemplo Completo

### ❌ ANTES (Incorrecto):
```typescript
async getNonce() {
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'POST',  // ❌ Esto causa el 404
    headers: {
      'Content-Type': 'application/json'
    }
  });
  // ...
}
```

### ✅ DESPUÉS (Correcto):
```typescript
async getNonce() {
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'GET',  // ✅ GET es el correcto
    // No necesitas headers para GET
  });
  // ...
}
```

## 🧪 Verificar

Después de cambiar:

1. Guarda el archivo
2. Recarga tu aplicación
3. Intenta hacer login de nuevo
4. El error 404 debería desaparecer

## ✅ Checklist

- [ ] Abrí `authApi.ts`
- [ ] Encontré la función `getNonce()` (línea ~54)
- [ ] Cambié `method: 'POST'` a `method: 'GET'`
- [ ] Guardé el archivo
- [ ] Recargué la aplicación
- [ ] Probé hacer login de nuevo

---

**¡Eso es todo!** Solo necesitas cambiar una palabra: `POST` → `GET` 🎉

