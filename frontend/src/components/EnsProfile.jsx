import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import './EnsProfile.css';

export const EnsProfile = () => {
  const { address } = useAccount();
  const { data: name } = useEnsName({ address, chainId: 1 });
  const { data: avatar } = useEnsAvatar({ name, chainId: 1 });

  if (!address) {
    return (
      <div className="ens-profile">
        <p>Por favor, conecta tu wallet</p>
      </div>
    );
  }

  return (
    <div className="ens-profile">
      {avatar && (
        <img 
          src={avatar} 
          alt={`Avatar de ${name || address}`}
          className="ens-profile-avatar"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="ens-profile-info">
        <h2>{name || 'Sin ENS'}</h2>
        <p className="ens-profile-address">{address}</p>
      </div>
    </div>
  );
};

export default EnsProfile;

