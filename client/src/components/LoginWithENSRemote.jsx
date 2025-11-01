import { useState } from 'react';
import { ethers } from 'ethers';
import './LoginWithENS.css';

/**
 * Componente de Login con ENS que se conecta a una API remota
 * 
 * USO:
 * <LoginWithENSRemote 
 *   apiUrl="https://tu-api.com/api" 
 *   onLoginSuccess={(token, user) => {...}} 
 * />
 */
const LoginWithENSRemote = ({ 
  apiUrl = '/api', // URL base de la API (default: relativa)
  onLoginSuccess 
}) => {
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      throw new Error(
        'No se detectó una wallet. Por favor, instala MetaMask u otra wallet compatible.'
      );
    }

    // Solicitar acceso a la cuenta
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const getENSFromAddress = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const resolvedName = await provider.lookupAddress(address);
      return resolvedName;
    } catch (error) {
      return null;
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Verificar conexión de wallet
      await checkWalletConnection();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Si el usuario no proporcionó un ENS, intentar resolver desde la dirección
      let finalENS = ensName.trim();
      if (!finalENS) {
        const resolvedENS = await getENSFromAddress(address);
        if (resolvedENS) {
          finalENS = resolvedENS;
        } else {
          throw new Error(
            'Por favor, ingresa tu nombre ENS o conecta una wallet asociada a un ENS'
          );
        }
      }

      // Asegurar que termine en .eth
      if (!finalENS.endsWith('.eth')) {
        finalENS = `${finalENS}.eth`;
      }

      finalENS = finalENS.toLowerCase();

      // Obtener nonce del servidor REMOTO
      const nonceResponse = await fetch(`${apiUrl}/auth/nonce`);
      if (!nonceResponse.ok) {
        throw new Error('No se pudo conectar con el servidor de autenticación');
      }
      const { nonce, timestamp } = await nonceResponse.json();

      // Asegurar que el nonce es un string
      const nonceString = typeof nonce === 'string' ? nonce : String(nonce);
      const timestampString = String(timestamp);

      console.log('[Login Remote] Datos de autenticación:', {
        ensName: finalENS,
        nonce: nonceString,
        timestamp: timestampString,
        address,
        apiUrl
      });

      // Crear mensaje a firmar (formato exacto)
      const message = `Autenticación ENS\n\nNombre: ${finalENS}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;

      console.log('[Login Remote] Mensaje a firmar:', message);

      // Solicitar firma al usuario
      const signature = await signer.signMessage(message);
      
      console.log('[Login Remote] Firma obtenida:', signature);

      // Enviar datos al backend REMOTO para validación
      const response = await fetch(`${apiUrl}/auth/ens-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ensName: finalENS,
          signature,
          nonce: nonceString,
          timestamp: timestampString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      // Autenticación exitosa
      console.log('[Login Remote] Login exitoso:', data.user);
      onLoginSuccess(data.token, data.user);

    } catch (err) {
      console.error('[Login Remote] Error en login:', err);
      setError(err.message || 'Error desconocido al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-with-ens">
      <div className="ens-input-group">
        <label htmlFor="ens-name">Nombre ENS (opcional)</label>
        <input
          id="ens-name"
          type="text"
          placeholder="usuario.eth"
          value={ensName}
          onChange={(e) => setEnsName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          disabled={loading}
          className="ens-input"
        />
        <p className="input-hint">
          Si tienes un ENS asociado a tu wallet, puedes dejarlo vacío
        </p>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="ens-login-button"
      >
        {loading ? (
          <span className="button-loading">
            <span className="spinner"></span>
            Autenticando...
          </span>
        ) : (
          '🔐 Iniciar Sesión con ENS'
        )}
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="info-box">
        <h3>¿Cómo funciona?</h3>
        <ul>
          <li>Conecta tu wallet (MetaMask, WalletConnect, etc.)</li>
          <li>Firma un mensaje para probar la propiedad de tu ENS</li>
          <li>Inicia sesión sin contraseñas ni terceros</li>
        </ul>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888' }}>
          Conectado a: {apiUrl}
        </p>
      </div>
    </div>
  );
};

export default LoginWithENSRemote;

