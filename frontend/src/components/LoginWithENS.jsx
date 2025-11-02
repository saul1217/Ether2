import { useState } from 'react';
import { useAccount, useEnsName, useConnect, useSignMessage } from 'wagmi';
import './LoginWithENS.css';

const LoginWithENS = ({ onLoginSuccess }) => {
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hooks de wagmi para obtener datos de la wallet
  const { address, isConnected } = useAccount();
  const { data: resolvedENSName } = useEnsName({ 
    address: address || undefined, 
    chainId: 1 
  });
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  // Función para conectar wallet
  const checkWalletConnection = async () => {
    if (!isConnected) {
      // Intentar conectar con el primer conector disponible (MetaMask, Injected, etc.)
      const metaMaskConnector = connectors.find(
        connector => connector.id === 'metaMask' || connector.id === 'injected'
      );
      
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
        // Esperar un momento para que la conexión se complete
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error(
          'No se detectó una wallet. Por favor, instala MetaMask u otra wallet compatible.'
        );
      }
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Verificar conexión de wallet
      await checkWalletConnection();

      // Si no hay wallet conectada después de intentar conectar, lanzar error
      if (!isConnected || !address) {
        throw new Error(
          'Por favor, conecta tu wallet primero'
        );
      }

      // Si el usuario no proporcionó un ENS, usar el resuelto por wagmi
      let finalENS = ensName.trim();
      if (!finalENS) {
        if (resolvedENSName) {
          finalENS = resolvedENSName;
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

      // Obtener nonce del servidor
      const nonceResponse = await fetch('/api/auth/nonce');
      const { nonce, timestamp } = await nonceResponse.json();

      // ✅ Convertir nonce a string hexadecimal (puede venir en varios formatos)
      let nonceString;
      
      console.log('[Login] 🔍 Nonce recibido - Tipo:', typeof nonce, 'Valor:', nonce);
      
      if (Array.isArray(nonce)) {
        // Si viene como array de números, convertir a hexadecimal
        // Ejemplo: [131, 179, 238...] -> "83b3ee..."
        nonceString = nonce.map(n => {
          const num = parseInt(n, 10);
          return num.toString(16).padStart(2, '0');
        }).join('');
        console.log('[Login] ⚠️ Nonce recibido como array, convertido a hex:', nonceString.substring(0, 20) + '...');
      } else if (typeof nonce === 'string') {
        // Si viene como string con comas (array serializado)
        if (nonce.includes(',') && /^\d+,\d+/.test(nonce)) {
          // Ejemplo: "131,179,238,23..." -> convertir a hex
          const numbers = nonce.split(',').map(n => parseInt(n.trim(), 10));
          nonceString = numbers.map(n => n.toString(16).padStart(2, '0')).join('');
          console.log('[Login] ⚠️ Nonce recibido como string con comas, convertido a hex:', nonceString.substring(0, 20) + '...');
        } else {
          // Ya es string hexadecimal, usar directamente
          nonceString = nonce.trim();
          // Verificar que sea hexadecimal válido
          if (!/^[0-9a-f]+$/i.test(nonceString)) {
            console.error('[Login] ❌ Nonce string no es hexadecimal válido:', nonceString.substring(0, 50));
            throw new Error('Nonce recibido en formato inválido. Debe ser hexadecimal.');
          }
        }
      } else if (nonce && typeof nonce === 'object' && nonce.length) {
        // Si es un objeto tipo array pero no Array.isArray (Uint8Array, etc)
        const arr = Array.from(nonce);
        nonceString = arr.map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
        console.log('[Login] ⚠️ Nonce recibido como objeto array, convertido a hex:', nonceString.substring(0, 20) + '...');
      } else {
        // Otro tipo, intentar convertir
        const str = String(nonce);
        if (str.includes(',')) {
          // Intentar parsear como array con comas
          const numbers = str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
          if (numbers.length > 0) {
            nonceString = numbers.map(n => n.toString(16).padStart(2, '0')).join('');
            console.log('[Login] ⚠️ Nonce recibido en formato desconocido, intentando convertir desde:', str.substring(0, 30));
          } else {
            throw new Error('Nonce en formato no reconocido: ' + typeof nonce);
          }
        } else {
          nonceString = str;
        }
      }
      
      const timestampString = String(timestamp);
      
      // Verificación final - debe ser hexadecimal válido
      if (!nonceString || !/^[0-9a-f]+$/i.test(nonceString)) {
        console.error('[Login] ❌ ERROR: Nonce no es hexadecimal válido después de conversión');
        console.error('  - Valor original:', nonce);
        console.error('  - Tipo original:', typeof nonce);
        console.error('  - Valor convertido:', nonceString);
        throw new Error('Nonce debe ser string hexadecimal válido. Recibido: ' + typeof nonce + ', valor: ' + String(nonce).substring(0, 50));
      }
      
      console.log('[Login] ✅ Nonce procesado correctamente:', {
        original: typeof nonce,
        convertido: nonceString.substring(0, 20) + '...',
        longitud: nonceString.length,
        esHexadecimal: true
      });

      console.log('[Login] Datos de autenticación:', {
        ensName: finalENS,
        nonce: nonceString,
        timestamp: timestampString,
        address
      });

      // Crear mensaje a firmar (formato exacto)
      const message = `Autenticación ENS\n\nNombre: ${finalENS}\nNonce: ${nonceString}\nTimestamp: ${timestampString}`;

      console.log('[Login] Mensaje a firmar:', message);
      console.log('[Login] Usando wagmi useSignMessage hook');

      // Solicitar firma al usuario usando wagmi
      const signature = await signMessageAsync({ message });
      
      console.log('[Login] Firma obtenida:', signature);

      // Enviar datos al backend para validación
      const response = await fetch('/api/auth/ens-login', {
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

      // Debug: ver qué datos recibe del backend
      console.log('[Login] Datos recibidos del backend:', data);
      console.log('[Login] User object:', data.user);
      console.log('[Login] Balance:', data.user?.balance);
      console.log('[Login] Balance USD:', data.user?.balanceUSD);

      // Autenticación exitosa
      onLoginSuccess(data.token, data.user);

    } catch (err) {
      console.error('Error en login:', err);
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
        disabled={loading || isConnecting || isSigning}
        className="ens-login-button"
      >
        {(loading || isConnecting || isSigning) ? (
          <span className="button-loading">
            <span className="spinner"></span>
            {isConnecting ? 'Conectando...' : isSigning ? 'Firmando...' : 'Autenticando...'}
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
      </div>
    </div>
  );
};

export default LoginWithENS;

