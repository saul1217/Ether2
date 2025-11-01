# 📝 Cómo Crear el Archivo .env

## Ubicación

El archivo `.env` debe estar en la carpeta `server/`:
```
Ether/
└── server/
    ├── .env          ← AQUÍ
    ├── index.js
    └── package.json
```

## Opción 1: Crear Manualmente (Windows)

1. Abre la carpeta `server/`
2. Crea un nuevo archivo de texto
3. Nómbralo `.env` (sin extensión)
   - Si Windows te advierte sobre la extensión, acepta
   - Debe ser exactamente `.env` (no `.env.txt`)
4. Copia el contenido desde `env.example` (que está en la raíz del proyecto)
5. Edita los valores según tus necesidades

## Opción 2: Copiar desde env.example

**En Windows (PowerShell):**
```powershell
cd server
copy ..\env.example .env
```

**En Linux/Mac:**
```bash
cd server
cp ../env.example .env
```

## Opción 3: Crear desde Código

Ya existe un archivo `server/.env` creado automáticamente con valores por defecto.

## Contenido Mínimo

El archivo `.env` debe contener al menos:

```env
PORT=3001
JWT_SECRET=tu-clave-secreta-aqui
```

Para usar la API desde otros dominios, agrega:

```env
ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
```

## Verificar que Funciona

1. El archivo debe estar en `server/.env`
2. No debe tener extensión `.txt` o `.env.txt`
3. El servidor lo leerá automáticamente al iniciar

## Importante

- El archivo `.env` NO se sube a Git (está en `.gitignore`)
- Nunca compartas tu `JWT_SECRET` públicamente
- En producción, usa una clave secreta fuerte y única

