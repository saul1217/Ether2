# 🔄 Migración de Estructura de Carpetas

Se ha reorganizado el proyecto para separar claramente frontend y backend:

## ✅ Nuevas Carpetas

- **`frontend/`** - Aplicación React (antes `client/`)
- **`backend/`** - API Node.js/Express (antes `server/`)
- **`docs/`** - Toda la documentación del proyecto

## 📝 Cambios Realizados

1. ✅ Creadas las nuevas carpetas `frontend/`, `backend/`, y `docs/`
2. ✅ Copiado el contenido de `client/` → `frontend/`
3. ✅ Copiado el contenido de `server/` → `backend/`
4. ✅ Movida la documentación a `docs/`
5. ✅ Actualizado `package.json` con las nuevas rutas
6. ✅ Actualizado `README.md` con las nuevas instrucciones
7. ✅ Creado `.gitignore` para el proyecto
8. ✅ Creado `ESTRUCTURA_PROYECTO.md` con la nueva estructura

## 🗑️ Limpieza (Opcional)

Las carpetas antiguas `client/` y `server/` todavía existen. Puedes eliminarlas cuando estés seguro de que todo funciona:

```bash
# Solo cuando hayas verificado que todo funciona en las nuevas carpetas
Remove-Item -Path "client" -Recurse -Force
Remove-Item -Path "server" -Recurse -Force
```

**⚠️ IMPORTANTE:** Asegúrate de:
1. Detener cualquier servidor que esté corriendo
2. Cerrar cualquier editor/IDE que tenga abiertas esas carpetas
3. Verificar que `frontend/` y `backend/` tienen todo el contenido necesario

## 🚀 Uso de las Nuevas Carpetas

### Desarrollo
```bash
# Opción 1: Ejecutar ambos a la vez
npm run dev

# Opción 2: Por separado
npm run dev:backend   # Backend en puerto 3001
npm run dev:frontend  # Frontend en puerto 3000
```

### Instalación
```bash
# Instalar todo
npm run install:all

# O manualmente:
cd backend && npm install
cd ../frontend && npm install
```

## 📚 Referencias

- Ver `ESTRUCTURA_PROYECTO.md` para la estructura completa
- Ver `README.md` para instrucciones actualizadas

