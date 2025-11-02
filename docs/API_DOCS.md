# 🌐 Documentación de la API de Autenticación ENS

Esta documentación describe cómo usar el backend de autenticación ENS como servicio remoto desde cualquier página web.

## 🎯 ¿Qué es esto?

En lugar de instalar el backend en cada proyecto, puedes usar **un backend centralizado** al que múltiples sitios web pueden conectarse. Tu página y la de tu amigo pueden usar el mismo servicio.

## 🔗 URL Base de la API

**Producción:**
```
https://tu-dominio.com/api
```

**Desarrollo:**
```
http://localhost:3001/api
```

---

## 📡 Endpoints Disponibles

### 1. Obtener Nonce

Genera un nonce único para el proceso de autenticación.

**Endpoint:** `GET /api/auth/nonce`

**Request:**
```http
GET /api/auth/nonce
```

**Response (200 OK):**
```json
{
  "nonce": "a1b2c3d4e5f6...",
  "timestamp": "1762003558136"
}
```

**Ejemplo JavaScript:**
```javascript
const response = await fetch('https://tu-dominio.com/api/auth/nonce');
const { nonce, timestamp } = await response.json();
```

---

### 2. Iniciar Sesión con ENS

Autentica un usuario usando su nombre ENS y firma criptográfica.

**Endpoint:** `POST /api/auth/ens-login`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "ensName": "usuario.eth",
  "signature": "0x1234567890abcdef...",
  "nonce": "a1b2c3d4e5f6...",
  "timestamp": "1762003558136"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "ensName": "usuario.eth",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (400/401 Error):**
```json
{
  "error": "Mensaje de error descriptivo"
}
```

**Ejemplo JavaScript:**
```javascript
const response = await fetch('https://tu-dominio.com/api/auth/ens-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ensName: 'usuario.eth',
    signature: '0x...',
    nonce: 'abc123...',
    timestamp: '1762003558136'
  })
});

const data = await response.json();
if (response.ok) {
  console.log('Token:', data.token);
  localStorage.setItem('ensAuthToken', data.token);
} else {
  console.error('Error:', data.error);
}
```

---

### 3. Verificar Token

Verifica si un token JWT es válido y obtiene información del usuario.

**Endpoint:** `GET /api/auth/verify`

**Request Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "ensName": "usuario.eth",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Token inválido"
}
```

**Ejemplo JavaScript:**
```javascript
const token = localStorage.getItem('ensAuthToken');
const response = await fetch('https://tu-dominio.com/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
if (data.valid) {
  console.log('Usuario autenticado:', data.user);
} else {
  console.error('Token inválido');
}
```

---

## 🔒 Seguridad y CORS

### Configuración CORS

El servidor debe estar configurado para aceptar requests desde los dominios autorizados:

```javascript
// En server/index.js
app.use(cors({
  origin: [
    'https://tu-pagina.com',
    'https://pagina-de-tu-amigo.com',
    'http://localhost:3000' // Para desarrollo
  ],
  credentials: true
}));
```

### Rate Limiting

- Máximo **10 intentos de login** por IP cada **15 minutos**
- Esto protege contra ataques de fuerza bruta

---

## 💻 Ejemplo Completo de Integración

### HTML + JavaScript Puro

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
</head>
<body>
  <button id="login-btn">Iniciar Sesión con ENS</button>
  <div id="user-info"></div>

  <script>
    const API_URL = 'https://tu-dominio.com/api'; // Cambia esta URL

    async function loginWithENS() {
      // 1. Verificar wallet
      if (!window.ethereum) {
        alert('Instala MetaMask');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 2. Obtener ENS (opcional)
      let ensName = prompt('Nombre ENS (ej: usuario.eth) o deja vacío:');
      if (!ensName) {
        ensName = await provider.lookupAddress(address);
        if (!ensName) {
          alert('Ingresa un ENS');
          return;
        }
      }
      if (!ensName.endsWith('.eth')) ensName += '.eth';
      ensName = ensName.toLowerCase();

      // 3. Obtener nonce
      const { nonce, timestamp } = await (
        await fetch(`${API_URL}/auth/nonce`)
      ).json();

      // 4. Firmar mensaje
      const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      const signature = await signer.signMessage(message);

      // 5. Autenticar
      const response = await fetch(`${API_URL}/auth/ens-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensName, signature, nonce, timestamp })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ensAuthToken', data.token);
        document.getElementById('user-info').innerHTML = `
          <h2>Bienvenido, ${data.user.ensName}!</h2>
          <p>Dirección: ${data.user.address}</p>
        `;
      } else {
        alert('Error: ' + data.error);
      }
    }

    document.getElementById('login-btn').onclick = loginWithENS;

    // Verificar si ya está logueado
    async function checkAuth() {
      const token = localStorage.getItem('ensAuthToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        document.getElementById('user-info').innerHTML = `
          <h2>Bienvenido de nuevo, ${data.user.ensName}!</h2>
        `;
      }
    }

    checkAuth();
  </script>
</body>
</html>
```

### React

```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const API_URL = 'https://tu-dominio.com/api'; // Cambia esta URL

function LoginWithENS({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // ... código de login usando API_URL
      const { nonce, timestamp } = await (
        await fetch(`${API_URL}/auth/nonce`)
      ).json();

      // ... resto del código igual
      
      const response = await fetch(`${API_URL}/auth/ens-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensName, signature, nonce, timestamp })
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Autenticando...' : 'Iniciar Sesión con ENS'}
      </button>
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
```

---

## 🛠️ Configuración del Servidor

### Variables de Entorno

```env
# .env en el servidor
PORT=3001
JWT_SECRET=tu-clave-secreta-muy-fuerte
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Dominios permitidos (opcional, para CORS estricto)
ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
```

### Desplegar en Producción

**Opciones populares:**
- **Heroku**: `git push heroku main`
- **Railway**: Conecta tu repo de GitHub
- **Vercel**: Para el backend, usa Vercel CLI
- **DigitalOcean**: Droplet con Node.js
- **AWS/Google Cloud**: EC2/Compute Engine

---

## 📊 Límites y Consideraciones

### Rate Limiting
- 10 intentos de login por IP cada 15 minutos
- Puedes ajustar en `server/index.js`

### Almacenamiento
- Los usuarios se almacenan en memoria por defecto
- En producción, deberías usar una base de datos

### Escalabilidad
- Para alta demanda, considera:
  - Redis para nonces
  - Base de datos para usuarios
  - Load balancer para múltiples instancias

---

## 🔐 Seguridad Adicional (Opcional)

### API Keys (Recomendado para Producción)

Si quieres controlar quién puede usar tu API:

```javascript
// En server/index.js
const API_KEYS = new Set([
  'api-key-de-tu-amigo',
  'otra-api-key'
]);

app.use('/api/auth', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !API_KEYS.has(apiKey)) {
    return res.status(403).json({ error: 'API key inválida' });
  }
  next();
});
```

Luego en el frontend:
```javascript
fetch(`${API_URL}/auth/nonce`, {
  headers: {
    'X-API-Key': 'api-key-de-tu-amigo'
  }
});
```

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el servidor esté corriendo
2. Revisa los logs del servidor
3. Verifica la configuración de CORS
4. Asegúrate de que la URL de la API sea correcta

---

## ✅ Checklist para Compartir tu API

- [ ] Servidor desplegado y accesible públicamente
- [ ] CORS configurado para aceptar el dominio de tu amigo
- [ ] HTTPS habilitado (recomendado)
- [ ] Variables de entorno configuradas correctamente
- [ ] Probado que los endpoints funcionan
- [ ] Documentación compartida con tu amigo

---

¡Ya tienes tu API lista para ser usada por múltiples sitios web! 🚀

