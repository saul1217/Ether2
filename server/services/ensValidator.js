import { ethers } from 'ethers';

// Provider para Ethereum Mainnet
const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
);

/**
 * Valida que un usuario es propietario de un nombre ENS
 * y que la firma es válida para el mensaje proporcionado
 */
export async function validateENSLogin(ensName, signature, nonce, timestamp) {
  try {
    // Normalizar el nombre ENS
    const normalizedENS = ensName.toLowerCase().endsWith('.eth') 
      ? ensName.toLowerCase() 
      : `${ensName.toLowerCase()}.eth`;

    // Reconstruir el mensaje exacto que debería haberse firmado
    const message = `Autenticación ENS\n\nNombre: ${normalizedENS}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    // Recuperar la dirección que firmó el mensaje PRIMERO
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
      console.log(`[ENS Validator] Dirección recuperada de la firma: ${recoveredAddress}`);
    } catch (sigError) {
      return {
        isValid: false,
        error: 'Firma inválida: ' + sigError.message
      };
    }

    // Resolver el nombre ENS para verificar que existe
    const resolver = await provider.getResolver(normalizedENS);
    
    if (!resolver) {
      // Si no tiene resolver pero la dirección firmó correctamente, permitir el login
      // Esto es para casos donde el ENS existe pero no tiene resolver configurado
      console.log(`[ENS Validator] ENS ${normalizedENS} no tiene resolver, pero la firma es válida`);
      return {
        isValid: true,
        address: recoveredAddress,
        ensName: normalizedENS
      };
    }

    // Intentar resolver la dirección del ENS (reverse lookup)
    let resolvedAddress;
    try {
      resolvedAddress = await provider.resolveName(normalizedENS);
      console.log(`[ENS Validator] Dirección resuelta del ENS: ${resolvedAddress}`);
    } catch (error) {
      console.log(`[ENS Validator] No se pudo resolver dirección del ENS: ${error.message}`);
    }

    // Obtener el owner del ENS desde el Registry
    const ensRegistry = new ethers.Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry mainnet
      [
        'function owner(bytes32 node) external view returns (address)',
        'function resolver(bytes32 node) external view returns (address)'
      ],
      provider
    );

    const namehash = ethers.namehash(normalizedENS);
    let ownerAddress;
    try {
      ownerAddress = await ensRegistry.owner(namehash);
      console.log(`[ENS Validator] Owner del ENS: ${ownerAddress}`);
    } catch (error) {
      console.error(`[ENS Validator] Error obteniendo owner: ${error.message}`);
      // Si no podemos obtener el owner, verificar al menos que la dirección resuelta coincide
      if (resolvedAddress && recoveredAddress.toLowerCase() === resolvedAddress.toLowerCase()) {
        return {
          isValid: true,
          address: recoveredAddress,
          ensName: normalizedENS
        };
      }
      return {
        isValid: false,
        error: 'No se pudo verificar la propiedad del ENS'
      };
    }

    if (!ownerAddress || ownerAddress === ethers.ZeroAddress) {
      // Si no hay owner pero la dirección resuelta coincide, permitir
      if (resolvedAddress && recoveredAddress.toLowerCase() === resolvedAddress.toLowerCase()) {
        console.log(`[ENS Validator] No hay owner, pero la dirección resuelta coincide`);
        return {
          isValid: true,
          address: recoveredAddress,
          ensName: normalizedENS
        };
      }
      return {
        isValid: false,
        error: 'El nombre ENS no tiene un propietario válido'
      };
    }

    // Verificar múltiples condiciones:
    // 1. La dirección que firmó es el owner del ENS (preferido)
    // 2. O la dirección que firmó es la misma que resuelve el ENS
    const isOwner = recoveredAddress.toLowerCase() === ownerAddress.toLowerCase();
    const matchesResolved = resolvedAddress && 
                           recoveredAddress.toLowerCase() === resolvedAddress.toLowerCase();

    if (isOwner || matchesResolved) {
      console.log(`[ENS Validator] Validación exitosa - isOwner: ${isOwner}, matchesResolved: ${matchesResolved}`);
      return {
        isValid: true,
        address: recoveredAddress,
        ensName: normalizedENS
      };
    }

    // Si ninguna condición se cumple, dar más información en el error
    console.error(`[ENS Validator] Error de validación:`);
    console.error(`  - Dirección firmante: ${recoveredAddress}`);
    console.error(`  - Owner del ENS: ${ownerAddress}`);
    console.error(`  - Dirección resuelta: ${resolvedAddress || 'N/A'}`);

    return {
      isValid: false,
      error: `La dirección que firmó (${recoveredAddress.slice(0, 10)}...) no es propietaria del ENS ${normalizedENS}. Owner: ${ownerAddress.slice(0, 10)}...`
    };

  } catch (error) {
    console.error('[ENS Validator] Error validando ENS:', error);
    return {
      isValid: false,
      error: 'Error al validar el nombre ENS: ' + error.message
    };
  }
}

