# 🔧 Corrección: Error en el Frontend

## 🐛 El Problema

El error es en el **frontend**. El mensaje que estás firmando **no coincide** con el formato que espera el backend.

### Lo que está pasando:

**Frontend actual (INCORRECTO):**
```
Por favor, firme este mensaje para autenticarse.

Nonce: 138,34,69,142,58,75,148,230,54,193,136,142,237,90,115,251,238,109,87,122,95,169,57,52,73,180,141,112,228,194,235,90

Timestamp: 1762027282108
```

**Backend espera (CORRECTO):**
```
Autenticación ENS

Nombre: saul12.eth
Nonce: abc123def456... (hexadecimal)
Timestamp: 1762027282108
```

### Problemas identificados:

1. ❌ **Mensaje diferente** - "Por favor, firme..." vs "Autenticación ENS"
2. ❌ **Falta el nombre ENS** - No incluye "Nombre: saul12.eth"
3. ❌ **Nonce en formato incorrecto** - Array de números `138,34,69...` en lugar de hexadecimal `abc123...`
4. ❌ **Estructura diferente** - No sigue el formato exacto

---

## ✅ Solución

### Cambiar el Código del Frontend

Necesitas actualizar tu código frontend para que coincida exactamente con lo que espera el backend:

```javascript
// 1. Obtener nonce del servidor
const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce');
const { nonce, timestamp } = await nonceResponse.json();

// 2. IMPORTANTE: El nonce ya viene como string hexadecimal, no como array
// Si recibes un array, conviértelo así:
let nonceString = nonce;
if (Array.isArray(nonce)) {
  // Convertir array de números a hex
  nonceString = '0x' + nonce.map(n => n.toString(16).padStart(2, '0')).join('');
} else if (typeof nonce === 'string') {
  nonceString = nonce;
} else {
  nonceString = String(nonce);
}

const timestampString = String(timestamp);

// 3. Obtener ENS name (ya lo tienes: saul12.eth)
const ensName = 'saul12.eth'; // O el que obtuviste del resolver

// 4. Crear mensaje EXACTO que espera el backend
const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;

console.log('Mensaje a firmar:', message);

// 5. Firmar el mensaje
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const signature = await signer.signMessage(message);

// 6. Enviar al backend
const response = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ensName: ensName,
    signature: signature,
    nonce: nonceString,  // IMPORTANTE: String hexadecimal, no array
    timestamp: timestampString
  })
});

const data = await response.json();
if (response.ok) {
  console.log('Login exitoso!', data);
} else {
  console.error('Error:', data.error);
}
```

---

## 🔍 Comparación Detallada

### ❌ Tu Código Actual (Incorrecto):

```javascript
// Nonce como array de números
Nonce: 138,34,69,142,58,75,148,230...

// Mensaje sin formato correcto
"Por favor, firme este mensaje para autenticarse."

// Sin incluir el nombre ENS
```

### ✅ Código Correcto:

```javascript
// Nonce como string hexadecimal
Nonce: abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890

// Mensaje con formato exacto
"Autenticación ENS\n\nNombre: saul12.eth\nNonce: abc123...\nTimestamp: 1762027282108"
```

---

## 📝 Pasos Específicos para Corregir

### Paso 1: Verificar el Nonce

El backend retorna el nonce como string hexadecimal. Si estás recibiendo un array, hay un error en cómo lo estás procesando:

```javascript
// El backend retorna:
{ nonce: "abc123def456...", timestamp: "1762027282108" }

// NO debería ser:
{ nonce: [138, 34, 69, ...], timestamp: ... }
```

### Paso 2: Usar el Mensaje Exacto

Copia exactamente este formato:

```javascript
const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;
```

**Importante:**
- Exactamente `Autenticación ENS` (no otra frase)
- Exactamente `\n\n` (dos saltos de línea)
- Exactamente `Nombre: ${ensName}` (con el nombre ENS)
- Exactamente `Nonce: ${nonceString}` (nonce como string)
- Exactamente `Timestamp: ${timestampString}` (timestamp como string)

### Paso 3: Enviar Datos Correctos

```javascript
body: JSON.stringify({
  ensName: 'saul12.eth',        // String con el ENS name
  signature: signature,          // Firma del mensaje
  nonce: nonceString,            // String hexadecimal (NO array)
  timestamp: timestampString     // String del timestamp
})
```

---

## 🧪 Código Completo de Ejemplo

Aquí está el código completo corregido:

```javascript
async function loginWithENS() {
  try {
    // 1. Conectar wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('Dirección conectada:', address);

    // 2. Obtener nonce del backend
    const nonceResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce');
    const nonceData = await nonceResponse.json();
    
    console.log('Nonce recibido:', nonceData);
    
    // 3. Asegurar formato correcto
    let nonceString = nonceData.nonce;
    if (Array.isArray(nonceString)) {
      // Convertir array a hex string
      nonceString = '0x' + nonceString.map(n => n.toString(16).padStart(2, '0')).join('');
    }
    nonceString = String(nonceString); // Asegurar que sea string
    
    const timestampString = String(nonceData.timestamp);
    
    // 4. Obtener ENS name
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
    
    console.log('ENS name a usar:', ensName);

    // 5. Crear mensaje EXACTO
    const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;
    
    console.log('Mensaje a firmar:', message);

    // 6. Firmar
    const signature = await signer.signMessage(message);
    console.log('Firma generada:', signature);

    // 7. Enviar al backend
    const response = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
      method: 'POST',
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

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso!', data);
      // Guardar token
      localStorage.setItem('ensAuthToken', data.token);
    } else {
      console.error('❌ Error:', data.error);
      alert('Error: ' + data.error);
    }
    
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error: ' + error.message);
  }
}
```

---

## 🔍 Verificación

Después de corregir, verifica:

1. **El mensaje que firmas** debe ser exactamente:
   ```
   Autenticación ENS

   Nombre: saul12.eth
   Nonce: abc123def456...
   Timestamp: 1762027282108
   ```

2. **El nonce** debe ser string hexadecimal, no array

3. **Los datos enviados** deben coincidir exactamente

---

## 📞 Si Aún Tiene Problemas

Revisa:
- Los logs del navegador para ver el mensaje exacto que estás firmando
- Los logs del servidor (Render) para ver qué está recibiendo
- Compara el mensaje firmado con el que espera el backend

---

¡Corrige el frontend y debería funcionar! 🎉

