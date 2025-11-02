# 🔧 Crear Archivo .env

## ⚠️ Problema

El error "Error generando token" indica que `JWT_SECRET` no está configurado.

## ✅ Solución Rápida

### Opción 1: El código ya tiene un valor por defecto

He actualizado el código para usar un valor por defecto en desarrollo. **Reinicia el servidor** y debería funcionar.

### Opción 2: Crear archivo .env (Recomendado)

1. **Crea el archivo `.env` en la carpeta `server/`:**

```bash
cd server
copy env.example .env
```

O manualmente:

2. **Crea `server/.env`** con este contenido:

```env
PORT=3001
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
ETHEREUM_RPC_URL=https://eth.llamarpc.com
NODE_ENV=development
```

3. **Reinicia el servidor:**

```bash
cd server
npm run dev
```

## 🔍 Verificar

Después de crear el `.env`, reinicia el servidor. Deberías ver en los logs:

```
🚀 Servidor corriendo en http://localhost:3001
```

Si sigue mostrando la advertencia, verifica que el archivo `.env` esté en `server/.env` y que tenga `JWT_SECRET` configurado.

---

**El código ahora funciona con un valor por defecto, pero es mejor crear el archivo `.env` con un JWT_SECRET seguro.** 🔐

