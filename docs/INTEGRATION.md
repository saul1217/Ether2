# 🔌 Guía de Integración del Módulo de Autenticación ENS

Esta guía te ayudará a integrar el módulo de autenticación ENS en tu propia página web o aplicación.

## Opciones de Integración

### Opción 1: Usar API Remota (Más Fácil) ⭐ NUEVO

Si alguien ya tiene el backend desplegado públicamente, puedes conectarte directamente:

**Ventajas:**
- ✅ No necesitas instalar backend
- ✅ No necesitas servidor propio
- ✅ Solo copias el componente React
- ✅ Funciona inmediatamente

**Pasos:**
1. Obtén la URL de la API (ej: `https://ens-auth.railway.app/api`)
2. Usa el componente modificado (ver `QUICK_START.md` Escenario 1)
3. Cambia la URL base en el componente

Ver `API_DOCS.md` para documentación completa de la API.

### Opción 2: Usar el Backend Existente (Recomendado para Inicio Rápido)

Si tienes acceso al servidor backend que ya está corriendo, puedes simplemente usar los endpoints desde tu frontend.

### Opción 2: Integración Completa (Backend + Frontend)

Integra tanto el backend como el frontend en tu proyecto.

### Opción 3: Solo Componente React

Si ya tienes un backend, solo necesitas el componente de React.

---

## 🚀 Integración Rápida (Frontend Solo)

Si tu amigo ya tiene un backend corriendo, puedes usar solo el componente de React.

### Paso 1: Copiar Archivos Necesarios

```bash
# Copia estos archivos a tu proyecto:
client/src/components/LoginWithENS.jsx
client/src/components/LoginWithENS.css
```

### Paso 2: Instalar Dependencias

```bash
npm install ethers
# o
yarn add ethers
```

### Paso 3: Usar el Componente

```jsx
import LoginWithENS from './components/LoginWithENS';

function MyApp() {
  const handleLoginSuccess = (token, userData) => {
    console.log('Usuario autenticado:', userData);
    // Guarda el token en localStorage o tu sistema de estado
    localStorage.setItem('ensAuthToken', token);
    // Redirige o actualiza el estado de tu aplicación
  };

  return (
    <div>
      <h1>Mi Página Web</h1>
      <LoginWithENS onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
```

### Paso 4: Configurar la URL del Backend

Si el backend está en una URL diferente, modifica el componente:

```jsx
// En LoginWithENS.jsx, cambia las URLs:
const API_BASE_URL = 'https://tu-backend.com'; // O usa variables de entorno

// Luego en las llamadas fetch:
const nonceResponse = await fetch(`${API_BASE_URL}/api/auth/nonce`);
const response = await fetch(`${API_BASE_URL}/api/auth/ens-login`, { ... });
```

---

## 📦 Integración Completa (Backend + Frontend)

### Para Proyectos Node.js/Express Existentes

#### Paso 1: Copiar Archivos del Backend

```bash
# Copia estos archivos a tu proyecto:
server/services/ensValidator.js
server/services/userService.js
```

#### Paso 2: Instalar Dependencias

```bash
npm install ethers jsonwebtoken express-rate-limit
```

#### Paso 3: Agregar Rutas a tu Express

```javascript
// En tu archivo de rutas principal (app.js o server.js)
import express from 'express';
import { validateENSLogin } from './services/ensValidator.js';
import { createOrGetUser, getUserByENS } from './services/userService.js';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();

// ... tu configuración existente ...

// Copiar el código de los endpoints desde server/index.js:
// - GET /api/auth/nonce
// - POST /api/auth/ens-login
// - GET /api/auth/verify

// Ver server/index.js para el código completo
```

#### Paso 4: Configurar Variables de Entorno

```env
JWT_SECRET=tu-clave-secreta-aqui
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### Para Proyectos con Base de Datos

Si tu proyecto ya usa una base de datos, reemplaza `userService.js`:

```javascript
// Ejemplo con MySQL/PostgreSQL
import { db } from './database.js';

export async function createOrGetUser(ensName, address) {
  // Buscar usuario existente
  let user = await db.query(
    'SELECT * FROM users WHERE ens_name = ?',
    [ensName.toLowerCase()]
  );

  if (user.length > 0) {
    // Actualizar dirección si cambió
    await db.query(
      'UPDATE users SET address = ?, updated_at = NOW() WHERE id = ?',
      [address, user[0].id]
    );
    return user[0];
  }

  // Crear nuevo usuario
  const result = await db.query(
    'INSERT INTO users (ens_name, address, created_at) VALUES (?, ?, NOW())',
    [ensName.toLowerCase(), address]
  );

  return {
    id: result.insertId,
    ensName: ensName.toLowerCase(),
    address,
    createdAt: new Date()
  };
}
```

---

## 🎨 Personalización del Componente

### Cambiar Estilos

Modifica `LoginWithENS.css` para que coincida con el diseño de tu sitio:

```css
/* Ejemplo: Cambiar colores del botón */
.ens-login-button {
  background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
}
```

### Traducir Textos

Edita los textos en `LoginWithENS.jsx`:

```jsx
// Cambiar textos
<label htmlFor="ens-name">ENS Name (optional)</label>
<button>🔐 Sign in with ENS</button>
```

### Agregar Customización

```jsx
<LoginWithENS
  onLoginSuccess={handleLoginSuccess}
  apiBaseUrl="https://mi-backend.com"  // Prop opcional
  buttonText="Conectar con ENS"        // Prop opcional
  theme="dark"                         // Prop opcional
/>
```

---

## 🔗 Integración con Frameworks Populares

### React (ya incluido)

Ver sección "Integración Rápida" arriba.

### Next.js

```jsx
// app/login/page.jsx o pages/login.jsx
'use client'; // Si usas App Router

import LoginWithENS from '@/components/LoginWithENS';

export default function LoginPage() {
  const handleLoginSuccess = (token, userData) => {
    // Guardar en cookies o estado
    document.cookie = `ensAuthToken=${token}; path=/`;
    // Redirigir
    window.location.href = '/dashboard';
  };

  return (
    <div>
      <LoginWithENS onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <LoginWithENS @login-success="handleLoginSuccess" />
</template>

<script>
import LoginWithENS from './components/LoginWithENS.vue';

export default {
  components: {
    LoginWithENS
  },
  methods: {
    handleLoginSuccess(token, userData) {
      localStorage.setItem('ensAuthToken', token);
      this.$router.push('/dashboard');
    }
  }
}
</script>
```

### WordPress

Crea un plugin o shortcode:

```php
<?php
// wp-content/plugins/ens-login/ens-login.php
function ens_login_shortcode() {
  // Enqueue scripts
  wp_enqueue_script('ethers', 'https://cdn.ethers.io/lib/ethers-5.7.umd.min.js');
  wp_enqueue_script('ens-login', plugin_dir_url(__FILE__) . 'login-with-ens.js');
  
  return '<div id="ens-login-container"></div>';
}
add_shortcode('ens_login', 'ens_login_shortcode');
```

### HTML/JavaScript Puro

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
  <link rel="stylesheet" href="login-with-ens.css">
</head>
<body>
  <div id="ens-login"></div>
  
  <script>
    // Adapta el código de LoginWithENS.jsx a JavaScript vanilla
    // O usa el componente React compilado
  </script>
</body>
</html>
```

---

## 🔐 Seguridad en Producción

1. **HTTPS Obligatorio**: Siempre usa HTTPS en producción
2. **JWT Secret Fuerte**: Genera una clave secreta segura
3. **Rate Limiting**: Ajusta los límites según tu tráfico
4. **CORS**: Configura CORS correctamente en el backend
5. **Variables de Entorno**: Nunca commits secretos

```javascript
// Ejemplo de configuración CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

---

## 📝 Ejemplo de Middleware de Autenticación

Para proteger rutas en tu backend:

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
}

// Uso en rutas protegidas
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

---

## 🧪 Pruebas

### Probar Localmente

1. Asegúrate de tener un nombre ENS en Ethereum Mainnet
2. Conecta MetaMask con la cuenta que es propietaria del ENS
3. Prueba el flujo completo de autenticación

### Verificar Integración

```javascript
// En la consola del navegador
localStorage.getItem('ensAuthToken'); // Debe devolver el token
fetch('/api/auth/verify', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('ensAuthToken')}` }
})
.then(r => r.json())
.then(console.log); // Debe mostrar datos del usuario
```

---

## 📞 Soporte

Si tienes problemas con la integración:
1. Revisa `TROUBLESHOOTING.md`
2. Verifica los logs del servidor
3. Revisa la consola del navegador
4. Asegúrate de que el backend esté accesible desde tu frontend

---

## 🎁 Compartir el Proyecto

Para compartir este módulo con tu amigo:

### Opción A: Compartir el Repositorio

```bash
# Si está en GitHub/GitLab
git clone https://github.com/tu-usuario/ens-auth-module.git

# Luego sigue las instrucciones en README.md
```

### Opción B: Crear un Paquete

```bash
# En la raíz del proyecto
npm pack

# Esto crea un archivo .tgz que puedes compartir
# Tu amigo puede instalar con:
npm install ./ens-auth-module-1.0.0.tgz
```

### Opción C: Solo Archivos Necesarios

Comparte estos archivos/carpetas:
- `server/services/ensValidator.js`
- `server/services/userService.js`
- `client/src/components/LoginWithENS.jsx`
- `client/src/components/LoginWithENS.css`
- `server/index.js` (como referencia)
- `README.md` y `INTEGRATION.md`

