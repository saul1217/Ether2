// ============================================
// CÓDIGO COMPLETO CORRECTO PARA TU FRONTEND
// ============================================
// ✅ COPIA Y ADAPTA ESTE CÓDIGO A TU authApi.ts

interface NonceResponse {
  nonce: string;
  timestamp: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    ensName: string;
    address: string;
    createdAt: string;
  };
}

interface AuthConfig {
  apiUrl?: string;
  enableDebug?: boolean;
}

/**
 * Servicio de Autenticación ENS
 * 
 * Ejemplo de uso:
 * ```typescript
 * const authService = new AuthApiService({
 *   apiUrl: 'https://ether2-7caz.onrender.com',
 *   enableDebug: true
 * });
 * 
 * const result = await authService.loginWithENS('saul12.eth', signer);
 * localStorage.setItem('token', result.token);
 * ```
 */
class AuthApiService {
  private apiUrl: string;
  private enableDebug: boolean;

  constructor(config: AuthConfig = {}) {
    // ✅ Para desarrollo local, usa: 'http://localhost:3001'
    // ✅ Para producción, usa: 'https://ether2-7caz.onrender.com'
    // O puedes usar: config.apiUrl || (import.meta.env.VITE_API_URL || 'http://localhost:3001')
    this.apiUrl = config.apiUrl || 
                  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                    ? 'http://localhost:3001'  // Desarrollo local
                    : 'https://ether2-7caz.onrender.com'); // Producción
    this.enableDebug = config.enableDebug ?? false;
  }

  /**
   * Obtener nonce del servidor
   * @returns Promise con nonce y timestamp
   */
  async getNonce(): Promise<NonceResponse> {
    try {
      const url = `${this.apiUrl}/api/auth/nonce`;
      
      if (this.enableDebug) {
        console.log('🔍 Obteniendo nonce de:', url);
      }

      const response = await fetch(url, {
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
      
      if (this.enableDebug) {
        console.log('✅ Nonce recibido:', {
          nonce: nonceString.substring(0, 20) + '...',
          timestamp: timestampString,
          nonceType: typeof nonceString,
          esHexadecimal: /^[0-9a-f]+$/i.test(nonceString),
          nonceLength: nonceString.length
        });
      }
      
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
   * Crear mensaje de autenticación en el formato correcto
   * @param ensName Nombre ENS (ej: "saul12.eth")
   * @param nonce Nonce hexadecimal
   * @param timestamp Timestamp como string
   * @returns Mensaje formateado para firmar
   */
  private createAuthMessage(ensName: string, nonce: string, timestamp: string): string {
    // ✅ Formato EXACTO que espera el backend
    const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    
    if (this.enableDebug) {
      console.log('📝 Mensaje a firmar:', message);
      console.log('🔍 Verificación del mensaje:');
      console.log('  - Empieza con "Autenticación ENS"?:', message.startsWith('Autenticación ENS'));
      console.log('  - Incluye nombre?:', message.includes(`Nombre: ${ensName}`));
      console.log('  - Incluye nonce?:', message.includes(`Nonce: ${nonce}`));
      console.log('  - Incluye timestamp?:', message.includes(`Timestamp: ${timestamp}`));
      console.log('  - Longitud total:', message.length);
    }
    
    return message;
  }

  /**
   * Normalizar nombre ENS
   * @param ensName Nombre ENS (con o sin .eth)
   * @returns Nombre ENS normalizado
   */
  private normalizeENSName(ensName: string): string {
    let normalized = ensName.toLowerCase().trim();
    
    // Agregar .eth si no lo tiene
    if (!normalized.endsWith('.eth')) {
      normalized = `${normalized}.eth`;
    }
    
    return normalized;
  }

  /**
   * Login con ENS usando MetaMask o cualquier signer de ethers
   * 
   * @param ensName Nombre ENS (ej: "saul12.eth" o "saul12")
   * @param signer Signer de ethers (ej: desde provider.getSigner())
   * @returns Promise con token y datos del usuario
   * 
   * @example
   * ```typescript
   * const provider = new ethers.BrowserProvider(window.ethereum);
   * const signer = await provider.getSigner();
   * const result = await authService.loginWithENS('saul12.eth', signer);
   * ```
   */
  async loginWithENS(ensName: string, signer: any): Promise<LoginResponse> {
    try {
      // Normalizar nombre ENS
      const normalizedENS = this.normalizeENSName(ensName);
      
      if (this.enableDebug) {
        console.log('🔐 Iniciando login con ENS:', normalizedENS);
      }
      
      // 1. Obtener nonce del servidor
      const { nonce, timestamp } = await this.getNonce();
      
      // ✅ VERIFICACIÓN: Asegurar que nonce sea string hexadecimal
      if (typeof nonce !== 'string' || !/^[0-9a-f]+$/i.test(nonce)) {
        throw new Error(`Nonce debe ser string hexadecimal. Recibido: ${typeof nonce}, valor: ${nonce}`);
      }
      
      // 2. Crear mensaje en formato EXACTO que espera el backend
      const message = this.createAuthMessage(normalizedENS, nonce, timestamp);
      
      // ❌ NO uses estos mensajes incorrectos:
      // - "Please sign this message to authenticate: ..."
      // - Mensaje sin el formato exacto
      // - Nonce como array ("228,183,6,149...")
      
      // 3. Firmar mensaje con MetaMask/signer
      if (this.enableDebug) {
        console.log('✍️ Firmando mensaje con MetaMask...');
      }
      
      const signature = await signer.signMessage(message);
      
      if (this.enableDebug) {
        console.log('✅ Firma obtenida:', signature.substring(0, 20) + '...');
      }
      
      // 4. Preparar payload
      const payload = {
        ensName: normalizedENS,
        signature: signature,
        nonce: nonce,        // ✅ String hexadecimal, NO array
        timestamp: timestamp
      };
      
      if (this.enableDebug) {
        console.log('📤 Enviando payload a ens-login:', {
          ensName: payload.ensName,
          signature: payload.signature.substring(0, 20) + '...',
          nonce: payload.nonce.substring(0, 20) + '...',
          timestamp: payload.timestamp,
          nonceType: typeof payload.nonce,
          nonceLength: payload.nonce.length
        });
      }
      
      // 5. Enviar al backend
      const response = await fetch(`${this.apiUrl}/api/auth/ens-login`, {
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
      
      if (this.enableDebug) {
        console.log('✅ Login exitoso!', {
          token: data.token?.substring(0, 20) + '...',
          user: data.user
        });
      }
      
      return data as LoginResponse;
      
    } catch (error: any) {
      console.error('❌ Error en login ENS:', error);
      throw error;
    }
  }

  /**
   * Verificar token de autenticación
   * @param token Token JWT
   * @returns Datos del usuario si el token es válido
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { valid: false };
      }
      
      return { valid: true, user: data.user };
      
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return { valid: false };
    }
  }
}

// Exportar para usar en otros archivos
export default AuthApiService;
export { AuthApiService, type NonceResponse, type LoginResponse, type AuthConfig };

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

