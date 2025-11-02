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

    // Normalizar nonce si viene en formato incorrecto (array de números)
    let normalizedNonce = String(nonce);
    if (normalizedNonce.includes(',') && /^\d+,\d+/.test(normalizedNonce)) {
      // Si viene como "228,183,6,149..." (array de números), convertir a hexadecimal
      try {
        const numbers = normalizedNonce.split(',').map(n => parseInt(n.trim(), 10));
        if (numbers.length === 32 && numbers.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
          normalizedNonce = '0x' + numbers.map(n => n.toString(16).padStart(2, '0')).join('');
          console.log(`[ENS Validator] ⚠️ Nonce convertido de array a hexadecimal: ${normalizedNonce.substring(0, 20)}...`);
        } else {
          return {
            isValid: false,
            error: 'Formato de nonce inválido: debe ser string hexadecimal o array de 32 bytes'
          };
        }
      } catch (e) {
        return {
          isValid: false,
          error: 'Error al procesar nonce: formato incorrecto'
        };
      }
    } else if (!/^[0-9a-f]+$/i.test(normalizedNonce.replace(/^0x/, ''))) {
      // Si no es hexadecimal válido (sin 0x)
      return {
        isValid: false,
        error: 'Nonce debe ser string hexadecimal válido'
      };
    }

    // Reconstruir el mensaje exacto que debería haberse firmado
    const message = `Autenticación ENS\n\nNombre: ${normalizedENS}\nNonce: ${normalizedNonce}\nTimestamp: ${timestamp}`;

    // Logging detallado del mensaje usado
    console.log(`[ENS Validator] 📝 Mensaje usado para verificar:`);
    console.log(`  - Texto completo: ${JSON.stringify(message)}`);
    console.log(`  - Longitud: ${message.length}`);
    console.log(`  - ENS: ${normalizedENS}`);
    console.log(`  - Nonce: ${normalizedNonce.substring(0, 20)}... (longitud: ${normalizedNonce.length})`);
    console.log(`  - Timestamp: ${timestamp}`);
    console.log(`  - Bytes del mensaje:`, Buffer.from(message).toString('hex').substring(0, 40) + '...');

    // Recuperar la dirección que firmó el mensaje PRIMERO
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
      // Aplicar checksum correcto (EIP-55) para consistencia
      recoveredAddress = ethers.getAddress(recoveredAddress);
      console.log(`[ENS Validator] ✅ Dirección recuperada de la firma (checksummed): ${recoveredAddress}`);
    } catch (sigError) {
      // Agregar más información de debugging
      console.error(`[ENS Validator] Error verificando firma:`);
      console.error(`  - Mensaje usado: ${message}`);
      console.error(`  - Nonce usado: ${normalizedNonce}`);
      console.error(`  - Error: ${sigError.message}`);
      return {
        isValid: false,
        error: 'Firma inválida: El mensaje firmado no coincide con el esperado. Verifica que el formato del mensaje sea exactamente: "Autenticación ENS\\n\\nNombre: [ens].eth\\nNonce: [hex]\\nTimestamp: [timestamp]"'
      };
    }

    // Resolver el nombre ENS para verificar que existe
    const resolver = await provider.getResolver(normalizedENS);
    
    if (!resolver) {
      // Si no tiene resolver pero la dirección firmó correctamente, permitir el login
      // Esto es para casos donde el ENS existe pero no tiene resolver configurado
      console.log(`[ENS Validator] ENS ${normalizedENS} no tiene resolver, pero la firma es válida`);
      console.log(`[ENS Validator] Retornando dirección firmante: ${recoveredAddress}`);
      return {
        isValid: true,
        address: recoveredAddress, // Dirección que firmó el mensaje
        ensName: normalizedENS
      };
    }

    // Intentar resolver la dirección del ENS (reverse lookup)
    let resolvedAddress;
    try {
      resolvedAddress = await provider.resolveName(normalizedENS);
      if (resolvedAddress) {
        resolvedAddress = ethers.getAddress(resolvedAddress); // Checksum
        console.log(`[ENS Validator] Dirección resuelta del ENS: ${resolvedAddress}`);
      }
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
      if (ownerAddress && ownerAddress !== ethers.ZeroAddress) {
        ownerAddress = ethers.getAddress(ownerAddress); // Checksum
        console.log(`[ENS Validator] Owner del ENS (checksummed): ${ownerAddress}`);
      }
    } catch (error) {
      console.error(`[ENS Validator] Error obteniendo owner: ${error.message}`);
      // Si no podemos obtener el owner, verificar al menos que la dirección resuelta coincide
      if (resolvedAddress && recoveredAddress.toLowerCase() === resolvedAddress.toLowerCase()) {
        console.log(`[ENS Validator] Retornando dirección firmante: ${recoveredAddress}`);
        return {
          isValid: true,
          address: recoveredAddress, // Siempre la dirección que firmó
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
        console.log(`[ENS Validator] Retornando dirección firmante: ${recoveredAddress}`);
        return {
          isValid: true,
          address: recoveredAddress, // Siempre la dirección que firmó
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
      console.log(`[ENS Validator] Retornando dirección firmante: ${recoveredAddress}`);
      console.log(`[ENS Validator] Comparación - Firmante: ${recoveredAddress}, Owner: ${ownerAddress}, Resuelta: ${resolvedAddress || 'N/A'}`);
      return {
        isValid: true,
        address: recoveredAddress, // IMPORTANTE: Siempre retornar la dirección que firmó
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

