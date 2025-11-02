import { useState, useEffect } from 'react';
import LoginWithENS from './components/LoginWithENS';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('ensAuthToken');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('ensAuthToken');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('ensAuthToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('ensAuthToken', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ensAuthToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <div className="login-container">
          <h1 className="app-title">Bienvenido</h1>
          <p className="app-subtitle">
            Inicia sesión con tu nombre ENS para continuar
          </p>
          <LoginWithENS onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

