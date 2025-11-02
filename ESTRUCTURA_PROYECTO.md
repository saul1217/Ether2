# 📁 Estructura del Proyecto

Este proyecto está organizado en carpetas separadas para frontend y backend:

```
Ether/
├── frontend/           # Aplicación React (Frontend)
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/            # API Node.js/Express (Backend)
│   ├── services/
│   │   ├── ensValidator.js
│   │   ├── ensService.js
│   │   └── userService.js
│   ├── index.js
│   ├── package.json
│   ├── env.example
│   └── .env (crear desde env.example)
│
├── docs/               # Documentación del proyecto
│   ├── README.md
│   ├── INSTALL.md
│   ├── INTEGRATION.md
│   └── ... (otros archivos de documentación)
│
├── package.json        # Scripts principales del proyecto
└── README.md           # Documentación principal
```

## 🚀 Comandos Principales

### Desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O por separado:
npm run dev:frontend   # Solo frontend (puerto 3000)
npm run dev:backend    # Solo backend (puerto 3001)
```

### Instalación
```bash
# Instalar todas las dependencias
npm run install:all

# Setup inicial (instalar + crear .env)
npm run setup
```

### Producción
```bash
# Iniciar solo el backend
npm start
```

## 📝 Notas

- **Frontend**: Se ejecuta en `http://localhost:3000` (configurado en `frontend/vite.config.js`)
- **Backend**: Se ejecuta en `http://localhost:3001` (configurado en `backend/.env`)
- **Documentación**: Todos los archivos `.md` de referencia están en `docs/`

