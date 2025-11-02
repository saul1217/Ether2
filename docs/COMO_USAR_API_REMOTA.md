# 🌐 Cómo Usar la API Remota desde otra Página Web

Guía para integrar la API de autenticación ENS en tu propia página web.

## 📋 Requisitos Previos

1. ✅ Tienes la URL de la API desplegada (ej: `https://tu-api.com`)
2. ✅ Tienes acceso a editar el código de tu página web
3. ✅ Tienes instalado `ethers.js` en tu proyecto

## 🔗 Integración Básica

### Opción 1: Fetch API (Vanilla JavaScript)

```javascript
const API_URL = 'https://tu-api.com'; // Cambia por tu URL

// 1. Obtener nonce
async function getNonce() {
  const response = await fetch(`${API_URL}/api/auth/nonce`);
  const data = await response.json();
  return data;
}

// 2. Login con ENS
async function loginWithENS(ensName, signature, nonce, timestamp) {
  const response = await fetch(`${API_URL}/api/auth/ens-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ensName,
      signature,
      nonce,
      timestamp
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en autenticación');
  }
  
  return await response.json();
}

// 3. Verificar token
async function verifyToken(token) {
  const response = await fetch(`${API_URL}/api/auth/verify`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

### Ejemplo de Uso Completo:

```javascript
import { ethers } from 'ethers';

const API_URL = 'https://tu-api.com';

async function handleENSLogin() {
  try {
    // 1. Conectar wallet
    if (!window.ethereum) {
      throw new Error('MetaMask no detectado');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // 2. Obtener nonce
    const { nonce, timestamp } = await getNonce();
    
    // Convertir nonce a hexadecimal si viene como array
    let nonceString = nonce;
    if (Array.isArray(nonce)) {
      nonceString = nonce.map(n => 
        parseInt(n, 10).toString(16).padStart(2, '0')
      ).join('');
    }
    
    // 3. Crear mensaje
    const ensName = 'tu-nombre.eth'; // O resolver desde address
    const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestamp}`;
    
    // 4. Firmar mensaje
    const signature = await signer.signMessage(message);
    
    // 5. Enviar al backend
    const result = await loginWithENS(ensName, signature, nonceString, timestamp);
    
    // 6. Guardar token
    localStorage.setItem('ensAuthToken', result.token);
    
    console.log('Login exitoso!', result.user);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

---

## ⚛️ Opción 2: React Hook Personalizado

```javascript
// hooks/useENSAuth.js
import { useState } from 'react';
import { ethers } from 'ethers';

const API_URL = 'https://tu-api.com';

export function useENSAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (ensName) => {
    setLoading(true);
    setError(null);
    
    try {
      // Conectar wallet
      if (!window.ethereum) {
        throw new Error('MetaMask no detectado');
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Obtener nonce
      const nonceRes = await fetch(`${API_URL}/api/auth/nonce`);
      const { nonce, timestamp } = await nonceRes.json();
      
      // Convertir nonce
      let nonceString = Array.isArray(nonce)
        ? nonce.map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')
        : nonce;
      
      // Crear y firmar mensaje
      const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestamp}`;
      const signature = await signer.signMessage(message);
      
      // Login
      const response = await fetch(`${API_URL}/api/auth/ens-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensName, signature, nonce: nonceString, timestamp })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('ensAuthToken', data.token);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ensAuthToken');
  };

  return { login, logout, loading, error, user, token };
}
```

### Uso del Hook:

```jsx
import { useENSAuth } from './hooks/useENSAuth';

function LoginButton() {
  const { login, logout, loading, error, user } = useENSAuth();

  if (user) {
    return (
      <div>
        <p>Bienvenido, {user.ensName}!</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => login('tu-nombre.eth')} disabled={loading}>
        {loading ? 'Cargando...' : 'Login con ENS'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 🎨 Opción 3: Componente React Completo

```jsx
// components/LoginWithENS.jsx
import { useState } from 'react';
import { ethers } from 'ethers';

const API_URL = 'https://tu-api.com'; // Tu API

export default function LoginWithENS({ onLoginSuccess }) {
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Verificar MetaMask
      if (!window.ethereum) {
        throw new Error('MetaMask no detectado');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Obtener nonce
      const nonceRes = await fetch(`${API_URL}/api/auth/nonce`);
      const { nonce, timestamp } = await nonceRes.json();

      // Convertir nonce a hex
      let nonceString = Array.isArray(nonce)
        ? nonce.map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')
        : nonce.trim();

      const finalENS = ensName.trim() || 'tu-nombre.eth';
      const message = `Autenticación ENS\n\nNombre: ${finalENS}\nNonce: ${nonceString}\nTimestamp: ${timestamp}`;

      // Firmar
      const signature = await signer.signMessage(message);

      // Login
      const response = await fetch(`${API_URL}/api/auth/ens-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ensName: finalENS,
          signature,
          nonce: nonceString,
          timestamp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en autenticación');
      }

      localStorage.setItem('ensAuthToken', data.token);
      onLoginSuccess?.(data.token, data.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="usuario.eth"
        value={ensName}
        onChange={(e) => setEnsName(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Autenticando...' : 'Login con ENS'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 🔐 Usar Token en Peticiones Autenticadas

```javascript
// Verificar token antes de hacer peticiones protegidas
async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('ensAuthToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token inválido o expirado
    localStorage.removeItem('ensAuthToken');
    throw new Error('Sesión expirada');
  }

  return response.json();
}

// Ejemplo de uso
const userData = await makeAuthenticatedRequest('/api/auth/verify');
```

---

## 📝 Resumen de Endpoints

### `GET /api/auth/nonce`
Obtiene un nonce único para la autenticación.

**Response:**
```json
{
  "nonce": [131, 179, ...],
  "timestamp": "1234567890"
}
```

### `POST /api/auth/ens-login`
Autentica un usuario con ENS.

**Request:**
```json
{
  "ensName": "usuario.eth",
  "signature": "0x...",
  "nonce": "83b3ee...",
  "timestamp": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "ensName": "usuario.eth",
    "address": "0x...",
    "balance": "0.0234",
    "balanceUSD": 58.50,
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `GET /api/auth/verify`
Verifica un token JWT.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

---

## ⚠️ Notas Importantes

1. **CORS:** Asegúrate de que la API tiene `ALLOWED_ORIGINS=*` o incluye tu dominio
2. **HTTPS:** Siempre usa HTTPS en producción
3. **Nonce:** Siempre obtén un nonce nuevo antes de cada login
4. **Token:** Guarda el token de forma segura (localStorage es aceptable para este caso)
5. **Formato del mensaje:** El mensaje debe ser exactamente:
   ```
   Autenticación ENS\n\nNombre: {ensName}\nNonce: {nonce}\nTimestamp: {timestamp}
   ```

---

¡Listo! Ahora puedes usar la API desde cualquier página web. 🌐

