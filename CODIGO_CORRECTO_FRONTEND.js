// ============================================
// CÓDIGO CORREGIDO PARA EL FRONTEND
// ============================================

/**
 * Obtener nonce del servidor (GET, NO POST)
 */
async function obtenerNonce() {
  try {
    // ✅ GET request (NO POST)
    const response = await fetch('https://ether2-7caz.onrender.com/api/auth/nonce', {
      method: 'GET'  // O simplemente omite esta línea (GET es default)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Nonce recibido:', data);
    
    return {
      nonce: String(data.nonce),
      timestamp: String(data.timestamp)
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo nonce:', error);
    throw error;
  }
}

/**
 * Login completo con ENS
 */
async function loginWithENS() {
  try {
    // 1. Verificar MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }

    // 2. Conectar wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('✅ Dirección conectada:', address);

    // 3. Obtener nonce (GET, no POST)
    console.log('Obteniendo nonce para dirección:', address);
    const { nonce, timestamp } = await obtenerNonce();

    // 4. Obtener ENS name
    let ensName = await provider.lookupAddress(address);
    if (!ensName) {
      // Si no tiene ENS asociado, pedirlo
      ensName = prompt('Ingresa tu nombre ENS (ej: saul12.eth):');
      if (!ensName) {
        throw new Error('Se requiere un nombre ENS');
      }
    }

    // Normalizar ENS
    if (!ensName.endsWith('.eth')) {
      ensName = ensName + '.eth';
    }
    ensName = ensName.toLowerCase();
    
    console.log('✅ ENS name a usar:', ensName);

    // 5. Crear mensaje EXACTO (debe coincidir con el backend)
    const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    
    console.log('📝 Mensaje a firmar:', message);

    // 6. Firmar mensaje
    const signature = await signer.signMessage(message);
    console.log('✅ Firma generada:', signature);

    // 7. Enviar login al backend (este SÍ es POST)
    console.log('Enviando datos de login...');
    const loginResponse = await fetch('https://ether2-7caz.onrender.com/api/auth/ens-login', {
      method: 'POST',  // ✅ Este sí es POST
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ensName: ensName,
        signature: signature,
        nonce: nonce,
        timestamp: timestamp
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginData.error || 'Error en la autenticación');
    }

    console.log('✅ Login exitoso!', loginData);
    
    // 8. Guardar token
    localStorage.setItem('ensAuthToken', loginData.token);
    
    return {
      token: loginData.token,
      user: loginData.user
    };

  } catch (error) {
    console.error('❌ Error en login:', error);
    
    // Mostrar error amigable
    if (error.message.includes('404')) {
      alert('Error: Endpoint no encontrado. Verifica que estés usando GET para /api/auth/nonce');
    } else if (error.message.includes('401')) {
      alert('Error: ' + error.message);
    } else {
      alert('Error: ' + error.message);
    }
    
    throw error;
  }
}

/**
 * Verificar token existente
 */
async function verificarToken(token) {
  try {
    const response = await fetch('https://ether2-7caz.onrender.com/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
    
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

// ============================================
// USO
// ============================================

// Para hacer login:
// loginWithENS()
//   .then(({ token, user }) => {
//     console.log('Usuario autenticado:', user);
//   })
//   .catch(error => {
//     console.error('Login falló:', error);
//   });

// Para verificar token existente:
// const token = localStorage.getItem('ensAuthToken');
// if (token) {
//   verificarToken(token)
//     .then(user => {
//       if (user) {
//         console.log('Usuario autenticado:', user);
//       } else {
//         localStorage.removeItem('ensAuthToken');
//       }
//     });
// }

