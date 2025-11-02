# 🔧 Solución: Error "No permitido por CORS"

## ⚠️ Problema

Estás viendo el error "No permitido por CORS" cuando intentas acceder a tu API.

## ✅ Soluciones

### 1. Verificar Variables de Entorno

Asegúrate de que `ALLOWED_ORIGINS` está configurado correctamente en tu `.env`:

```env
# Para permitir TODOS los dominios:
ALLOWED_ORIGINS=*

# O para dominios específicos:
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### 2. En Render.com o Railway

En las variables de entorno de tu plataforma, agrega:

```
ALLOWED_ORIGINS=*
```

**⚠️ IMPORTANTE:** No incluyas espacios alrededor del `*`.

### 3. Verificar Logs del Servidor

Los logs ahora mostrarán información detallada sobre CORS:

```
[CORS] Request desde origin: https://tu-dominio.com
[CORS] ALLOWED_ORIGINS configurado: *
[CORS] allowedOrigins array: ['*']
[CORS] ✅ Permitido (ALLOWED_ORIGINS vacío o contiene '*')
```

### 4. Reiniciar el Servidor

Después de cambiar las variables de entorno:

1. **Local:** Detén y reinicia el servidor
2. **Render/Railway:** Haz un redeploy o reinicia el servicio

## 🔍 Debugging

Si sigue sin funcionar, revisa los logs del servidor para ver:
- ¿Qué origin está intentando acceder?
- ¿Qué valor tiene `ALLOWED_ORIGINS`?
- ¿Hay algún error adicional?

## 📝 Checklist

- [ ] `ALLOWED_ORIGINS=*` está configurado (o dominios específicos)
- [ ] No hay espacios alrededor del `*`
- [ ] El servidor se reinició después de cambiar variables
- [ ] Los logs muestran información de CORS
- [ ] Estás usando HTTPS (o localhost en desarrollo)

