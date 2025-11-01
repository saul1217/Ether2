// ============================================
// CORRECCIÓN PARA authApi.ts
// ============================================

// ❌ CÓDIGO ACTUAL (INCORRECTO) - Línea 54 aprox
/*
async getNonce() {
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'POST',  // ❌ ESTO ESTÁ CAUSANDO EL 404
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 404) {
    throw new Error('Endpoint /api/auth/nonce no encontrado (404)...');
  }
  
  // ...
}
*/

// ✅ CÓDIGO CORREGIDO - Copia esto a tu authApi.ts
/*
class AuthApiService {
  async getNonce() {
    // ✅ CAMBIO: method: 'GET' (o simplemente omite method, GET es el default)
    const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
      method: 'GET',  // ✅ CORREGIDO: Cambiado de POST a GET
      // No necesitas headers para GET requests
    });
    
    if (!response.ok) {
      throw new Error(`Endpoint /api/auth/nonce no encontrado (${response.status}). Por favor verifica que el endpoint exista en la API.`);
    }
    
    const data = await response.json();
    
    return {
      nonce: String(data.nonce),
      timestamp: String(data.timestamp)
    };
  }
}
*/

// ============================================
// SOLO COPIA ESTA FUNCIÓN A TU authApi.ts
// ============================================
export async function getNonce() {
  // ✅ CAMBIO: method: 'GET' (o simplemente omite method, GET es el default)
  const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
    method: 'GET',  // ✅ CORREGIDO: Cambiado de POST a GET
    // No necesitas headers para GET requests
  });
  
  if (!response.ok) {
    throw new Error(`Endpoint /api/auth/nonce no encontrado (${response.status}). Por favor verifica que el endpoint exista en la API.`);
  }
  
  const data = await response.json();
  
  return {
    nonce: String(data.nonce),
    timestamp: String(data.timestamp)
  };
}

// ============================================
// INSTRUCCIONES PASO A PASO
// ============================================

/*
1. Abre tu archivo: authApi.ts

2. Busca la función getNonce() (debe estar alrededor de la línea 54)

3. Busca esta línea:
   method: 'POST',  // ❌

4. Cámbiala por:
   method: 'GET',   // ✅

5. Opcionalmente, elimina la línea de headers (no es necesaria para GET)

6. Guarda el archivo

7. Recarga tu aplicación

8. Prueba de nuevo
*/

