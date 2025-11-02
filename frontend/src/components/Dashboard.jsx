import { useState, useEffect } from 'react';
import { useAccount, useEnsName, useEnsAvatar, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  // Hooks de wagmi para obtener datos de la wallet conectada
  const { address: connectedAddress } = useAccount();
  const { data: wagmiENSName } = useEnsName({ 
    address: connectedAddress || undefined, 
    chainId: 1 
  });
  const { data: wagmiAvatar } = useEnsAvatar({ 
    name: wagmiENSName || undefined, 
    chainId: 1 
  });
  const { data: balanceData } = useBalance({
    address: connectedAddress || undefined,
  });

  // Debug: ver qué datos recibe el componente
  console.log('[Dashboard] User recibido:', user);
  console.log('[Dashboard] User.balance:', user.balance);
  console.log('[Dashboard] User.balanceUSD:', user.balanceUSD);
  console.log('[Dashboard] Wagmi - Address:', connectedAddress);
  console.log('[Dashboard] Wagmi - ENS Name:', wagmiENSName);
  console.log('[Dashboard] Wagmi - Avatar:', wagmiAvatar);
  console.log('[Dashboard] Wagmi - Balance:', balanceData);
  
  // Preferir datos de wagmi si están disponibles, sino usar datos del backend
  const finalENSName = wagmiENSName || user?.ensName || null;
  const finalAvatar = wagmiAvatar || user?.avatar || null;
  const finalAddress = connectedAddress || user?.address || null;
  
  const [balance, setBalance] = useState(
    balanceData ? formatEther(balanceData.value) : (user?.balance || null)
  );
  const [balanceUSD, setBalanceUSD] = useState(user?.balanceUSD !== undefined ? user.balanceUSD : null);
  const [avatarError, setAvatarError] = useState(false);

  // Función auxiliar para calcular USD de un balance específico
  const calculateUSDForBalance = async (balanceValue) => {
    if (balanceValue && (!balanceUSD || balanceUSD === null)) {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          const ethPrice = data.ethereum.usd;
          const usdValue = balanceValue * ethPrice;
          setBalanceUSD(usdValue);
          console.log('[Dashboard] Balance USD calculado desde wagmi:', usdValue);
        }
      } catch (error) {
        console.error('Error obteniendo precio de ETH:', error);
      }
    }
  };

  // Obtener balance actualizado si no está disponible
  useEffect(() => {
    // Si ya tenemos balanceUSD del backend, usarlo
    if (user?.balanceUSD !== undefined && user?.balanceUSD !== null) {
      setBalanceUSD(user.balanceUSD);
      console.log('[Dashboard] Balance USD del backend:', user.balanceUSD);
    }
    
    // Si tenemos balance pero no USD, calcularlo
    const calculateUSD = async () => {
      const currentBalance = balance || user?.balance;
      if (currentBalance && (!balanceUSD || balanceUSD === null)) {
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
          const data = await response.json();
          if (data.ethereum && data.ethereum.usd) {
            const ethPrice = data.ethereum.usd;
            const balanceValue = parseFloat(currentBalance);
            const usdValue = balanceValue * ethPrice;
            setBalanceUSD(usdValue);
            console.log('[Dashboard] Balance USD calculado:', usdValue);
          }
        } catch (error) {
          console.error('Error obteniendo precio de ETH:', error);
        }
      }
    };
    
    // Si tenemos balance de wagmi, usarlo (prioridad)
    if (balanceData) {
      const balanceETH = formatEther(balanceData.value);
      const balanceValue = parseFloat(balanceETH);
      setBalance(balanceValue.toFixed(4));
      console.log('[Dashboard] Balance obtenido de wagmi:', balanceValue);
      
      // Calcular USD
      calculateUSDForBalance(balanceValue);
    } else if (!balance && (user?.balance || finalAddress)) {
      // Si no hay balance de wagmi pero tenemos datos del backend, usarlos
      if (user?.balance) {
        setBalance(user.balance);
        calculateUSD();
        console.log('[Dashboard] Balance obtenido del backend:', user.balance);
      }
    } else if (balance) {
      // Si ya tenemos balance, solo calcular USD si no lo tenemos
      calculateUSD();
    }
  }, [balance, balanceUSD, user?.balance, user?.balanceUSD, balanceData, finalAddress]);

  // Formatear balance para mostrar
  const formatBalance = (bal) => {
    if (!bal || bal === '0.0' || bal === '0') return '0.0000';
    const num = parseFloat(bal);
    if (num < 0.0001) return num.toFixed(8);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(4);
  };

  // Manejar error al cargar avatar
  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>¡Bienvenido!</h1>
          <button onClick={onLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar-container">
            {finalAvatar && !avatarError ? (
              <img 
                src={finalAvatar} 
                alt={`Avatar de ${finalENSName || finalAddress}`}
                className="user-avatar-img"
                onError={handleAvatarError}
              />
            ) : (
              <div className="user-avatar">
                <span>{(finalENSName || finalAddress || '?').charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="user-details">
            <h2 className="user-ens">{finalENSName || 'Sin ENS'}</h2>
            <p className="user-address">
              <strong>Dirección:</strong> {finalAddress || user?.address || 'N/A'}
            </p>
            {(balance !== null || user.balance) && (
              <div className="user-balance-container">
                <p className="user-balance">
                  <strong>Balance:</strong> {formatBalance(balance || user.balance)} ETH
                </p>
                {(() => {
                  const usdValue = balanceUSD !== null && balanceUSD !== undefined 
                    ? balanceUSD 
                    : (user.balanceUSD !== undefined && user.balanceUSD !== null ? user.balanceUSD : null);
                  
                  if (usdValue !== null && usdValue !== undefined) {
                    return (
                      <p className="user-balance-usd">
                        ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
            <p className="user-created">
              <strong>Miembro desde:</strong>{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </p>
            {connectedAddress && (
              <p className="wagmi-status">
                <strong>Estado Wagmi:</strong> ✅ Conectado en tiempo real
              </p>
            )}
          </div>
        </div>

        <div className="dashboard-content">
          <div className="feature-card">
            <h3>🔐 Autenticación Segura</h3>
            <p>
              Has iniciado sesión usando tu nombre ENS ({finalENSName || 'resuelto automáticamente'}) 
              y una firma criptográfica con Wagmi. No se requiere contraseña ni terceros.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌐 Web3 Native con Wagmi</h3>
            <p>
              Tu identidad está vinculada directamente a la blockchain. 
              Los datos se obtienen en tiempo real usando hooks de Wagmi 
              (useAccount, useEnsName, useEnsAvatar, useBalance).
            </p>
          </div>

          <div className="feature-card">
            <h3>🚀 Sin Centralización</h3>
            <p>
              No dependes de Google, Twitter u otros servicios centralizados
              para autenticarte. Wagmi maneja toda la conexión con tu wallet.
            </p>
          </div>
        </div>

        <div className="technical-info">
          <h3>Información Técnica</h3>
          <div className="tech-details">
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>ENS Name:</strong> {finalENSName || user?.ensName || 'N/A'}
            </div>
            <div>
              <strong>Wallet Address:</strong> {finalAddress || user?.address || 'N/A'}
            </div>
            {connectedAddress && (
              <div>
                <strong>Wagmi Connected:</strong> ✅ {connectedAddress}
                {wagmiENSName && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>ENS (Wagmi):</strong> {wagmiENSName}
                  </div>
                )}
                {balanceData && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Balance (Wagmi):</strong> {formatBalance(formatEther(balanceData.value))} ETH
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


