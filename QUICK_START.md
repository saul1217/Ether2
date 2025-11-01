# ⚡ Inicio Rápido - Para Integrar en tu Página Web

Esta guía te ayudará a integrar el login con ENS en **5 minutos**.

## 🎯 Escenario 1: Usar API Remota (Más Fácil) ⭐ NUEVO

Si tu amigo ya tiene el backend desplegado y accesible públicamente:

### 1. Obtén la URL de la API

Tu amigo te dará algo como:
```
https://ens-auth-api.railway.app/api
```

### 2. Usa el componente modificado

Copia `LoginWithENS.jsx` y modifica la línea de la API:

```jsx
// Al inicio del archivo
const API_BASE_URL = 'https://ens-auth-api.railway.app/api'; // Cambia esta URL

// Luego en las funciones, usa API_BASE_URL:
const nonceResponse = await fetch(`${API_BASE_URL}/auth/nonce`);
const response = await fetch(`${API_BASE_URL}/auth/ens-login`, { ... });
```

### 3. ¡Listo!

Ya puedes usar el login sin necesidad de backend propio. Ver `API_DOCS.md` para más detalles.

---

## 🎯 Escenario 2: Solo Quieres el Botón de Login (Sin Backend Propio)

Si tu amigo ya tiene el backend corriendo y solo quieres agregar el botón de login:

### 1. Descarga los archivos

Copia estos 2 archivos a tu proyecto:
- `client/src/components/LoginWithENS.jsx`
- `client/src/components/LoginWithENS.css`

### 2. Instala ethers.js

```bash
npm install ethers
```

### 3. Usa el componente

```jsx
import { useState } from 'react';
import LoginWithENS from './components/LoginWithENS';

function MiPagina() {
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (token, userData) => {
    // Guarda el token
    localStorage.setItem('ensAuthToken', token);
    // Guarda datos del usuario
    setUsuario(userData);
    console.log('¡Login exitoso!', userData);
  };

  return (
    <div>
      {!usuario ? (
        <LoginWithENS onLoginSuccess={handleLogin} />
      ) : (
        <div>
          <h1>Bienvenido, {usuario.ensName}!</h1>
          <button onClick={() => {
            localStorage.removeItem('ensAuthToken');
            setUsuario(null);
          }}>Cerrar Sesión</button>
        </div>
      )}
    </div>
  );
}
```

### 4. Configura la URL del backend (si es necesario)

Si el backend está en otra URL, edita `LoginWithENS.jsx`:

```jsx
// Al inicio del archivo, después de los imports:
const API_URL = 'https://backend-de-tu-amigo.com'; // Cambia esta URL

// Luego busca estas líneas y agrega API_URL:
const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`);
const response = await fetch(`${API_URL}/api/auth/ens-login`, { ... });
```

¡Listo! Ya tienes login con ENS funcionando.

---

## 🎯 Escenario 2: Quieres el Backend Completo

Si quieres instalar todo el sistema en tu servidor:

### 1. Copia estos archivos

```
server/
├── services/
│   ├── ensValidator.js
│   └── userService.js
└── index.js (copia las rutas que necesites)
```

### 2. Instala dependencias

```bash
npm install express cors ethers jsonwebtoken express-rate-limit dotenv
```

### 3. Agrega las rutas a tu Express

Abre `server/index.js` y copia estos endpoints a tu servidor:

```javascript
// Las rutas están en server/index.js, líneas:
// - GET /api/auth/nonce (línea ~30)
// - POST /api/auth/ens-login (línea ~45)
// - GET /api/auth/verify (línea ~108)
```

### 4. Configura variables de entorno

Crea un archivo `.env`:

```env
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### 5. Conecta a tu base de datos (opcional)

Reemplaza `userService.js` con tu lógica de base de datos (ver `INTEGRATION.md`).

---

## 🎯 Escenario 3: Solo HTML/JavaScript (Sin Framework)

### 1. Agrega estos scripts en tu HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Página con Login ENS</title>
  <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
  <style>
    /* Copia el contenido de LoginWithENS.css aquí */
  </style>
</head>
<body>
  <div id="login-container"></div>

  <script>
    const API_URL = 'https://backend-de-tu-amigo.com'; // Cambia esta URL

    async function loginWithENS() {
      // Verifica que MetaMask esté instalado
      if (!window.ethereum) {
        alert('Por favor instala MetaMask');
        return;
      }

      // Conecta wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Obtener ENS (opcional)
      let ensName = prompt('Ingresa tu nombre ENS (ej: usuario.eth) o deja vacío:');
      if (!ensName) {
        try {
          ensName = await provider.lookupAddress(address);
          if (!ensName) throw new Error();
        } catch {
          alert('Por favor ingresa un nombre ENS');
          return;
        }
      }

      if (!ensName.endsWith('.eth')) {
        ensName = ensName + '.eth';
      }
      ensName = ensName.toLowerCase();

      // Obtener nonce
      const { nonce, timestamp } = await (await fetch(`${API_URL}/api/auth/nonce`)).json();

      // Crear mensaje
      const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      // Firmar mensaje
      const signature = await signer.signMessage(message);

      // Enviar al backend
      const response = await fetch(`${API_URL}/api/auth/ens-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensName, signature, nonce, timestamp })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ensAuthToken', data.token);
        alert('¡Login exitoso! Bienvenido ' + data.user.ensName);
        // Recarga la página o actualiza la UI
        location.reload();
      } else {
        alert('Error: ' + data.error);
      }
    }

    // Botón de login
    document.getElementById('login-container').innerHTML = `
      <button onclick="loginWithENS()" style="padding: 15px; font-size: 16px;">
        🔐 Iniciar Sesión con ENS
      </button>
    `;
  </script>
</body>
</html>
```

---

## 🔍 Verificar que Funciona

1. Abre tu página web
2. Haz clic en "Iniciar Sesión con ENS"
3. Conecta MetaMask
4. Firma el mensaje
5. Deberías ver un mensaje de éxito y el token guardado en `localStorage`

Para verificar el token:

```javascript
// En la consola del navegador
console.log(localStorage.getItem('ensAuthToken'));
```

---

## ❓ Problemas Comunes

### "No se detectó una wallet"
- Instala MetaMask o otra wallet compatible
- Asegúrate de que esté desbloqueada

### "La firma no corresponde al propietario"
- Verifica que estés usando el ENS correcto
- Asegúrate de que tu wallet sea propietaria del ENS
- Ver `TROUBLESHOOTING.md` para más detalles

### "CORS error"
- El backend debe permitir tu dominio
- Verifica la configuración CORS en el servidor

---

## 📞 ¿Necesitas Más Ayuda?

- Lee `INTEGRATION.md` para integración avanzada
- Lee `TROUBLESHOOTING.md` para resolver problemas
- Revisa `README.md` para documentación completa

