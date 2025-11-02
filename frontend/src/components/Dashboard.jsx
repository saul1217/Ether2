import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  // Debug: ver qué datos recibe el componente
  console.log('[Dashboard] User recibido:', user);
  console.log('[Dashboard] User.balance:', user.balance);
  console.log('[Dashboard] User.balanceUSD:', user.balanceUSD);
  
  const [balance, setBalance] = useState(user.balance || null);
  const [balanceUSD, setBalanceUSD] = useState(user.balanceUSD !== undefined ? user.balanceUSD : null);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [avatarError, setAvatarError] = useState(false);

  // Obtener balance actualizado si no está disponible
  useEffect(() => {
    // Si ya tenemos balanceUSD del backend, usarlo
    if (user.balanceUSD !== undefined && user.balanceUSD !== null) {
      setBalanceUSD(user.balanceUSD);
      console.log('[Dashboard] Balance USD del backend:', user.balanceUSD);
    }
    
    // Si tenemos balance pero no USD, calcularlo
    const calculateUSD = async () => {
      const currentBalance = balance || user.balance;
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
    
    // Si no tenemos balance, obtenerlo
    const fetchBalance = async () => {
      if (!balance && user.address) {
        try {
          const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
          const balanceWei = await provider.getBalance(user.address);
          const balanceETH = ethers.formatEther(balanceWei);
          const balanceValue = parseFloat(balanceETH);
          setBalance(balanceValue.toFixed(4));
          
          // Calcular USD inmediatamente
          try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            if (data.ethereum && data.ethereum.usd) {
              const ethPrice = data.ethereum.usd;
              const usdValue = balanceValue * ethPrice;
              setBalanceUSD(usdValue);
              console.log('[Dashboard] Balance y USD obtenidos:', balanceValue, usdValue);
            }
          } catch (error) {
            console.error('Error obteniendo precio de ETH:', error);
          }
        } catch (error) {
          console.error('Error obteniendo balance:', error);
        }
      } else {
        // Si ya tenemos balance, solo calcular USD si no lo tenemos
        calculateUSD();
      }
    };

    fetchBalance();
  }, [balance, balanceUSD, user.balance, user.balanceUSD, user.address]);

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
            {avatar && !avatarError ? (
              <img 
                src={avatar} 
                alt={`Avatar de ${user.ensName}`}
                className="user-avatar-img"
                onError={handleAvatarError}
              />
            ) : (
              <div className="user-avatar">
                <span>{user.ensName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="user-details">
            <h2 className="user-ens">{user.ensName}</h2>
            <p className="user-address">
              <strong>Dirección:</strong> {user.address}
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
              {new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="feature-card">
            <h3>🔐 Autenticación Segura</h3>
            <p>
              Has iniciado sesión usando tu nombre ENS y una firma criptográfica.
              No se requiere contraseña ni terceros.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌐 Web3 Native</h3>
            <p>
              Tu identidad está vinculada directamente a la blockchain,
              dándote control total sobre tu cuenta.
            </p>
          </div>

          <div className="feature-card">
            <h3>🚀 Sin Centralización</h3>
            <p>
              No dependes de Google, Twitter u otros servicios centralizados
              para autenticarte.
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
              <strong>ENS Name:</strong> {user.ensName}
            </div>
            <div>
              <strong>Wallet Address:</strong> {user.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

