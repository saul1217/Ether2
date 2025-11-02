// ============================================
// EJEMPLO COMPLETO DE USO DEL SERVICIO
// ============================================

import { ethers } from 'ethers';
import AuthApiService from './CODIGO_FRONTEND_CORRECTO';

/**
 * Ejemplo 1: Uso básico con React/TypeScript
 */
export async function loginWithENSBasic() {
  try {
    // 1. Conectar a MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // 2. Obtener nombre ENS (opcional - puedes usar el que quieras)
    let ensName = await provider.lookupAddress(address);
    if (!ensName) {
      // Si no tiene ENS, usar la dirección o pedir al usuario
      ensName = 'saul12.eth'; // Cambiar por el ENS del usuario
    }
    
    // 3. Crear servicio de autenticación
    const authService = new AuthApiService({
      apiUrl: 'https://ether2-7caz.onrender.com',
      enableDebug: true // Activar logs para debugging
    });
    
    // 4. Hacer login
    const result = await authService.loginWithENS(ensName, signer);
    
    // 5. Guardar token
    localStorage.setItem('ensAuthToken', result.token);
    
    console.log('✅ Login exitoso:', result.user);
    return result;
    
  } catch (error: any) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
}

/**
 * Ejemplo 2: Componente React con hooks
 */
export function useENSLogin() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<any>(null);
  
  const login = async (ensName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const authService = new AuthApiService({
        apiUrl: 'https://ether2-7caz.onrender.com'
      });
      
      const result = await authService.loginWithENS(ensName, signer);
      
      localStorage.setItem('ensAuthToken', result.token);
      setUser(result.user);
      
      return result;
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const verifyAuth = async () => {
    const token = localStorage.getItem('ensAuthToken');
    if (!token) return false;
    
    const authService = new AuthApiService();
    const { valid, user: userData } = await authService.verifyToken(token);
    
    if (valid && userData) {
      setUser(userData);
      return true;
    }
    
    // Token inválido, limpiar
    localStorage.removeItem('ensAuthToken');
    setUser(null);
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('ensAuthToken');
    setUser(null);
  };
  
  return { login, verifyAuth, logout, loading, error, user };
}

/**
 * Ejemplo 3: Uso directo sin React
 */
export async function loginDirectExample() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const authService = new AuthApiService();
  
  // Login
  const result = await authService.loginWithENS('saul12.eth', signer);
  
  // Guardar token
  localStorage.setItem('token', result.token);
  
  // Verificar token más tarde
  const { valid, user } = await authService.verifyToken(result.token);
  
  if (valid) {
    console.log('Usuario autenticado:', user);
  }
}

/**
 * Ejemplo 4: Manejo de errores completo
 */
export async function loginWithErrorHandling() {
  try {
    // Verificar MetaMask
    if (!window.ethereum) {
      throw new Error('Por favor instala MetaMask para continuar');
    }
    
    // Solicitar acceso a cuentas
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Obtener ENS o usar dirección
    let ensName = await provider.lookupAddress(address);
    if (!ensName) {
      // Mostrar modal o input para que el usuario ingrese su ENS
      ensName = prompt('Ingresa tu nombre ENS (ej: saul12.eth):');
      if (!ensName) {
        throw new Error('Se requiere un nombre ENS');
      }
    }
    
    const authService = new AuthApiService({
      apiUrl: 'https://ether2-7caz.onrender.com',
      enableDebug: true
    });
    
    const result = await authService.loginWithENS(ensName, signer);
    
    // Guardar token y datos del usuario
    localStorage.setItem('ensAuthToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    
    return {
      success: true,
      user: result.user,
      token: result.token
    };
    
  } catch (error: any) {
    // Manejar diferentes tipos de errores
    if (error.code === 4001) {
      // Usuario rechazó la conexión
      return { success: false, error: 'Conexión rechazada por el usuario' };
    }
    
    if (error.message?.includes('Nonce')) {
      return { success: false, error: 'Error con el nonce. Intenta de nuevo.' };
    }
    
    if (error.message?.includes('propietaria')) {
      return { success: false, error: 'La wallet no es propietaria del ENS ingresado' };
    }
    
    return {
      success: false,
      error: error.message || 'Error desconocido en la autenticación'
    };
  }
}

