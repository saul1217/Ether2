import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
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
          <div className="user-avatar">
            <span>{user.ensName.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="user-details">
            <h2 className="user-ens">{user.ensName}</h2>
            <p className="user-address">
              <strong>Dirección:</strong> {user.address}
            </p>
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

