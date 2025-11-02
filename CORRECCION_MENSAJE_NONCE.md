# 🔧 Corrección: Mensaje y Nonce Incorrectos

## 🐛 Problemas Detectados

### Problema 1: Mensaje Incorrecto

**Lo que tienes ahora (INCORRECTO):**
```
Please sign this message to authenticate: 211,30,118,255...
```

**Debe ser (CORRECTO):**
```
Autenticación ENS

Nombre: saul12.eth
Nonce: abc123def456... (string hexadecimal)
Timestamp: 1762048908161
```

### Problema 2: Nonce en Formato Incorrecto

**Lo que tienes ahora (INCORRECTO):**
```
nonce: '211,30,118,255,110,13,237,8...' (array de números como string)
```

**Debe ser (CORRECTO):**
```
nonce: 'd32e76ff6e0ded08a4fab47457e7f75417fcc206b1d0a6454189638a4b462a61' (string hexadecimal)
```

## ✅ Solución Completa

### Paso 1: Obtener Nonce Correctamente

```typescript
async getNonce() {
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'GET'  // ✅ GET, no POST
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // ✅ El backend retorna nonce como string hexadecimal
  // Ejemplo: { nonce: "d32e76ff6e0ded08...", timestamp: "1762048908161" }
  
  return {
    nonce: String(data.nonce),      // ✅ String hexadecimal
    timestamp: String(data.timestamp)
  };
}
```

### Paso 2: Crear Mensaje Correcto

```typescript
async loginWithENS(ensName: string, signature: string) {
  // 1. Obtener nonce (ya corregido arriba)
  const { nonce, timestamp } = await this.getNonce();
  
  // 2. ✅ Crear mensaje EXACTO que espera el backend
  const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
  
  console.log('📝 Mensaje a firmar:', message);
  // Debe mostrar:
  // Autenticación ENS
  //
  // Nombre: saul12.eth
  // Nonce: d32e76ff6e0ded08...
  // Timestamp: 1762048908161
  
  // 3. Firmar mensaje
  const signature = await signer.signMessage(message);
  
  // 4. Enviar al backend
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ensName: ensName,
      signature: signature,
      nonce: nonce,        // ✅ String hexadecimal, NO array
      timestamp: timestamp
    })
  });
}
```

## 🔍 Formato Exacto del Mensaje

El mensaje debe ser **exactamente** así:

```javascript
`Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`
```

**Importante:**
- `Autenticación ENS` (no "Please sign...")
- `\n\n` (dos saltos de línea exactos)
- `Nombre: saul12.eth` (con dos puntos y espacio)
- `Nonce: abc123...` (nonce como string hexadecimal)
- `Timestamp: 1762048908161` (timestamp como string)

## 📝 Código Completo Corregido

```typescript
class AuthApiService {
  async getNonce() {
    const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // ✅ Asegurar que nonce sea string hexadecimal
    const nonceString = String(data.nonce);
    const timestampString = String(data.timestamp);
    
    console.log('✅ Nonce recibido:', { nonce: nonceString, timestamp: timestampString });
    
    return {
      nonce: nonceString,
      timestamp: timestampString
    };
  }
  
  async loginWithENS(ensName: string, signer: any) {
    try {
      // 1. Obtener nonce
      const { nonce, timestamp } = await this.getNonce();
      
      // 2. ✅ Crear mensaje con formato EXACTO
      const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      
      console.log('📝 Mensaje a firmar:', message);
      console.log('🔍 Verificación del formato:');
      console.log('  - Empieza con "Autenticación ENS"?:', message.startsWith('Autenticación ENS'));
      console.log('  - Incluye nombre ENS?:', message.includes(`Nombre: ${ensName}`));
      console.log('  - Nonce es string?:', typeof nonce === 'string');
      console.log('  - Nonce es hexadecimal?:', /^[0-9a-f]+$/i.test(nonce));
      
      // 3. Firmar mensaje
      const signature = await signer.signMessage(message);
      console.log('✅ Firma generada:', signature);
      
      // 4. Enviar al backend
      const response = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ensName: ensName,
          signature: signature,
          nonce: nonce,        // ✅ String hexadecimal
          timestamp: timestamp
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }
}
```

## 🔍 Debugging

Agrega estos logs para verificar:

```typescript
console.log('🔍 Debug Nonce:');
console.log('  - Tipo:', typeof nonce);
console.log('  - Valor:', nonce);
console.log('  - Es array?:', Array.isArray(nonce));
console.log('  - Longitud:', nonce.length);
console.log('  - Es hexadecimal?:', /^[0-9a-f]+$/i.test(nonce));

console.log('🔍 Debug Mensaje:');
console.log('  - Mensaje completo:', message);
console.log('  - Formato correcto?:', message === `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`);
```

## ✅ Checklist

- [ ] Nonce es string hexadecimal (no array de números)
- [ ] Mensaje empieza con "Autenticación ENS"
- [ ] Mensaje incluye "Nombre: saul12.eth"
- [ ] Mensaje incluye "Nonce: abc123..." (hexadecimal)
- [ ] Mensaje incluye "Timestamp: 1762048908161"
- [ ] Formato tiene exactamente `\n\n` (dos saltos de línea)

---

**Cambia el mensaje de "Please sign..." a "Autenticación ENS\n\nNombre: ..." y asegúrate de que el nonce sea string hexadecimal.** 🎯

