// ============================================
// CÓDIGO COMPLETO CORRECTO PARA TU FRONTEND
// ============================================

// ✅ COPIA ESTE CÓDIGO A TU authApi.ts

class AuthApiService {
  
  /**
   * Obtener nonce del servidor
   */
  async getNonce() {
    try {
      const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
        method: 'GET'  // ✅ GET, no POST
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // ✅ El backend retorna nonce como string hexadecimal
      // Ejemplo: { nonce: "d32e76ff6e0ded08...", timestamp: "1762048995492" }
      
      const nonceString = String(data.nonce);        // ✅ String hexadecimal
      const timestampString = String(data.timestamp);
      
      console.log('✅ Nonce recibido:', {
        nonce: nonceString,
        timestamp: timestampString,
        nonceType: typeof nonceString,
        esHexadecimal: /^[0-9a-f]+$/i.test(nonceString)
      });
      
      // ✅ VERIFICACIÓN: El nonce debe ser string hexadecimal (no array)
      if (!/^[0-9a-f]+$/i.test(nonceString)) {
        console.error('❌ ERROR: Nonce no es hexadecimal:', nonceString);
        throw new Error('Nonce recibido en formato incorrecto. Debe ser string hexadecimal.');
      }
      
      return {
        nonce: nonceString,
        timestamp: timestampString
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo nonce:', error);
      throw error;
    }
  }
  
  /**
   * Login con ENS
   */
  async loginWithENS(ensName: string, signer: any) {
    try {
      console.log('🔐 Iniciando login con ENS:', ensName);
      
      // 1. Obtener nonce
      const { nonce, timestamp } = await this.getNonce();
      
      // ✅ VERIFICACIÓN: Asegurar que nonce sea string hexadecimal
      if (typeof nonce !== 'string' || !/^[0-9a-f]+$/i.test(nonce)) {
        throw new Error('Nonce debe ser string hexadecimal. Recibido: ' + typeof nonce);
      }
      
      // 2. ✅ Crear mensaje EXACTO que espera el backend
      // Formato: "Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}"
      const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      
      console.log('📝 Mensaje a firmar:', message);
      console.log('🔍 Verificación del mensaje:');
      console.log('  - Empieza con "Autenticación ENS"?:', message.startsWith('Autenticación ENS'));
      console.log('  - Incluye nombre?:', message.includes(`Nombre: ${ensName}`));
      console.log('  - Incluye nonce?:', message.includes(`Nonce: ${nonce}`));
      console.log('  - Incluye timestamp?:', message.includes(`Timestamp: ${timestamp}`));
      console.log('  - Longitud total:', message.length);
      
      // ❌ NO uses estos mensajes incorrectos:
      // - "Please sign this message to authenticate: ..."
      // - Mensaje sin el formato exacto
      // - Nonce como array
      
      // 3. Firmar mensaje
      console.log('✍️ Firmando mensaje con MetaMask...');
      const signature = await signer.signMessage(message);
      console.log('✅ Firma obtenida:', signature);
      
      // 4. Preparar payload
      const payload = {
        ensName: ensName,
        signature: signature,
        nonce: nonce,        // ✅ String hexadecimal, NO array
        timestamp: timestamp
      };
      
      console.log('📤 Enviando payload a ens-login:', {
        ensName: payload.ensName,
        signature: payload.signature.substring(0, 20) + '...',
        nonce: payload.nonce.substring(0, 20) + '...',
        timestamp: payload.timestamp,
        nonceType: typeof payload.nonce,
        nonceLength: payload.nonce.length
      });
      
      // 5. Enviar al backend
      const response = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }
      
      console.log('✅ Login exitoso!', data);
      return data;
      
    } catch (error: any) {
      console.error('❌ Error en login ENS:', error);
      throw error;
    }
  }
}

// ============================================
// USO EN MetaMaskLogin.tsx
// ============================================

/*
async function handleENSLogin() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Obtener ENS name
    let ensName = await provider.lookupAddress(address);
    if (!ensName) {
      ensName = 'saul12.eth'; // O pedir al usuario
    }
    
    // Normalizar ENS
    if (!ensName.endsWith('.eth')) {
      ensName = ensName + '.eth';
    }
    ensName = ensName.toLowerCase();
    
    console.log('Wallet ENS:', ensName);
    console.log('Dirección firmada:', address);
    
    // Usar el servicio
    const authService = new AuthApiService();
    const result = await authService.loginWithENS(ensName, signer);
    
    // Guardar token
    localStorage.setItem('ensAuthToken', result.token);
    
    return result;
    
  } catch (error: any) {
    console.error('Error completo en login ENS:', error);
    throw error;
  }
}
*/

