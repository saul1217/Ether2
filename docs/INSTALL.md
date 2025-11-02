# 🚀 Guía de Instalación Rápida

## Opción 1: Instalación Automática (Recomendada)

```bash
# Instalar todas las dependencias
npm run install:all

# Configurar variables de entorno
npm run setup
```

## Opción 2: Instalación Manual

### Paso 1: Instalar dependencias del servidor
```bash
cd server
npm install
cp env.example .env
cd ..
```

### Paso 2: Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

### Paso 3: Configurar variables de entorno
Edita `server/.env` y ajusta si es necesario (opcional, funcionará con valores por defecto).

## Ejecutar el Proyecto

```bash
# Desarrollo (servidor y cliente simultáneamente)
npm run dev
```

O por separado:

**Terminal 1:**
```bash
cd server
npm run dev
```

**Terminal 2:**
```bash
cd client
npm run dev
```

## Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Prueba la Autenticación

1. Abre http://localhost:3000
2. Asegúrate de tener MetaMask instalado y una cuenta conectada
3. Si tienes un nombre ENS, ingrésalo (o déjalo vacío si está asociado a tu wallet)
4. Haz clic en "Iniciar Sesión con ENS"
5. Firma el mensaje en MetaMask
6. ¡Listo! Deberías estar autenticado

## Notas

- Necesitas un nombre ENS en Ethereum Mainnet para probar
- Si no tienes ENS, puedes usar cualquier dirección Ethereum para pruebas (pero necesitarás modificar el código de validación)
- El sistema usa un RPC público por defecto, pero puedes configurar el tuyo en `.env`

