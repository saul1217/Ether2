# 🔧 Solución: Error 404 en `/api/auth/nonce`

## 🐛 El Problema

Estás haciendo un **POST** al endpoint de nonce, pero ese endpoint es **GET**.

**Tu código actual (INCORRECTO):**
```javascript
POST https://ether2-7caz.onrender.com/api/auth/nonce
// ❌ 404 Not Found
```

**Debe ser (CORRECTO):**
```javascript
GET https://ether2-7caz.onrender.com/api/auth/nonce
// ✅ 200 OK
```

---

## ✅ Solución

### Cambiar de POST a GET

El endpoint de nonce solo acepta **GET requests**, no POST.

**Código Correcto:**

```javascript
// ❌ INCORRECTO
const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'POST',  // ❌ Esto causa el 404
  // ...
});

// ✅ CORRECTO
const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
  method: 'GET',  // ✅ O simplemente omitir method (GET es el default)
  // ...
});

// O más simple:
const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce');
```

---

## 📝 Código Completo Corregido

```javascript
async function obtenerNonce() {
  try {
    // ✅ GET request (no POST)
    const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
      method: 'GET',  // O simplemente omite esta línea
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!nonceResponse.ok) {
      throw new Error(`Error ${nonceResponse.status}: ${nonceResponse.statusText}`);
    }

    const { nonce, timestamp } = await nonceResponse.json();
    
    console.log('Nonce recibido:', { nonce, timestamp });
    
    return { nonce, timestamp };
    
  } catch (error) {
    console.error('Error obteniendo nonce:', error);
    throw error;
  }
}
```

---

## 🔍 Endpoints Disponibles

### ✅ GET `/api/auth/nonce`
- **Método:** GET (no POST)
- **No requiere body**
- **Respuesta:**
  ```json
  {
    "nonce": "abc123def456...",
    "timestamp": "1762027282108"
  }
  ```

### ✅ POST `/api/auth/ens-login`
- **Método:** POST
- **Requiere body:**
  ```json
  {
    "ensName": "usuario.eth",
    "signature": "0x...",
    "nonce": "abc123...",
    "timestamp": "1762027282108"
  }
  ```

### ✅ GET `/api/auth/verify`
- **Método:** GET
- **Requiere header:** `Authorization: Bearer <token>`

---

## 🛠️ Código Completo de Ejemplo

```javascript
async function loginWithENS() {
  try {
    // 1. Conectar wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // 2. Obtener nonce (GET, no POST)
    console.log('Obteniendo nonce para dirección:', address);
    
    const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
      method: 'GET'  // ✅ GET, no POST
    });

    if (!nonceResponse.ok) {
      throw new Error(`Error ${nonceResponse.status}: No se pudo obtener nonce`);
    }

    const { nonce, timestamp } = await nonceResponse.json();
    console.log('Nonce recibido:', { nonce, timestamp });

    // 3. Obtener ENS name
    let ensName = await provider.lookupAddress(address);
    if (!ensName) {
      ensName = prompt('Ingresa tu nombre ENS (ej: saul12.eth)');
    }
    if (!ensName) {
      throw new Error('Se requiere un nombre ENS');
    }

    // Normalizar ENS
    if (!ensName.endsWith('.eth')) {
      ensName = ensName + '.eth';
    }
    ensName = ensName.toLowerCase();

    // Asegurar formato correcto
    const nonceString = String(nonce);
    const timestampString = String(timestamp);

    // 4. Crear mensaje EXACTO
    const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;
    console.log('Mensaje a firmar:', message);

    // 5. Firmar mensaje
    const signature = await signer.signMessage(message);
    console.log('Firma generada:', signature);

    // 6. Enviar login (este SÍ es POST)
    const loginResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
      method: 'POST',  // ✅ Este sí es POST
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ensName: ensName,
        signature: signature,
        nonce: nonceString,
        timestamp: timestampString
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log('✅ Login exitoso!', loginData);
      localStorage.setItem('ensAuthToken', loginData.token);
      return loginData;
    } else {
      throw new Error(loginData.error || 'Error en login');
    }

  } catch (error) {
    console.error('Error en login:', error);
    alert('Error: ' + error.message);
    throw error;
  }
}
```

---

## 📊 Comparación

| Endpoint | Método | ¿Requiere Body? | ¿Qué hace? |
|----------|--------|-----------------|------------|
| `/api/auth/nonce` | **GET** | ❌ No | Obtiene nonce único |
| `/api/auth/ens-login` | **POST** | ✅ Sí | Autentica usuario |
| `/api/auth/verify` | **GET** | ❌ No | Verifica token |

---

## ✅ Checklist

- [ ] Cambiar `method: 'POST'` a `method: 'GET'` en la llamada a `/api/auth/nonce`
- [ ] O simplemente omitir el `method` (GET es el default)
- [ ] Verificar que la URL sea correcta: `https://ether2-7caz.onrender.com/api/auth/nonce`
- [ ] El endpoint de login (`/api/auth/ens-login`) sí debe ser POST

---

## 🎯 Resumen

**El problema:**
- Estás haciendo POST a un endpoint que solo acepta GET

**La solución:**
- Cambia a GET (o omite el method, GET es el default)
- Solo `/api/auth/ens-login` debe ser POST

---

¡Cambia POST a GET y debería funcionar! 🎉

