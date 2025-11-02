# Cómo usar el componente EnsProfile

El componente `EnsProfile` usa los hooks de wagmi para obtener automáticamente el ENS name y avatar de una wallet conectada.

## Ubicación del componente

**Archivo:** `frontend/src/components/EnsProfile.jsx`

## Hooks utilizados

```jsx
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';

export const EnsProfile = () => {
  const { address } = useAccount();
  const { data: name } = useEnsName({ address, chainId: 1 });
  const { data: avatar } = useEnsAvatar({ name, chainId: 1 });
  
  // ... resto del componente
};
```

## Cómo usar en tu aplicación

### 1. En App.jsx

```jsx
import EnsProfile from './components/EnsProfile';

function App() {
  return (
    <div>
      <EnsProfile />
      {/* Resto de tu aplicación */}
    </div>
  );
}
```

### 2. En Dashboard.jsx

```jsx
import EnsProfile from './components/EnsProfile';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div>
      <EnsProfile />
      {/* Información adicional del usuario */}
    </div>
  );
};
```

## Requisitos

- ✅ Wagmi v2 configurado en `main.jsx`
- ✅ QueryClientProvider configurado
- ✅ Wallet conectada (MetaMask, etc.)

## Funcionalidades

- **useAccount()**: Obtiene la dirección de la wallet conectada
- **useEnsName()**: Resuelve el ENS name desde la dirección
- **useEnsAvatar()**: Obtiene el avatar del ENS

## Notas

- El componente requiere que wagmi esté configurado globalmente
- Si no hay wallet conectada, muestra un mensaje
- Si no hay ENS asociado, muestra "Sin ENS"
- El avatar se carga automáticamente si existe

