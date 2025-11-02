import { ethers } from 'ethers';

// Provider para Ethereum Mainnet
const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
);

/**
 * Resuelve un ENS name desde una dirección Ethereum
 * @param {string} address - Dirección Ethereum (checksummed o lowercase)
 * @returns {Promise<string|null>} ENS name o null si no tiene
 */
export async function resolveENSFromAddress(address) {
  try {
    const normalizedAddress = ethers.getAddress(address); // Asegurar checksum
    const ensName = await provider.lookupAddress(normalizedAddress);
    
    if (ensName) {
      console.log(`[ENS Resolver] ENS encontrado para ${normalizedAddress}: ${ensName}`);
      // Normalizar: asegurar que termine en .eth
      const normalized = ensName.toLowerCase().endsWith('.eth') 
        ? ensName.toLowerCase() 
        : `${ensName.toLowerCase()}.eth`;
      return normalized;
    }
    
    console.log(`[ENS Resolver] No hay ENS asociado a ${normalizedAddress}`);
    return null;
  } catch (error) {
    console.error(`[ENS Resolver] Error resolviendo ENS desde dirección:`, error.message);
    return null;
  }
}

/**
 * Verifica si un string es una dirección Ethereum (no un ENS name)
 * @param {string} input - String a verificar
 * @returns {boolean} true si es una dirección
 */
export function isEthereumAddress(input) {
  try {
    // Intentar parsear como dirección
    ethers.getAddress(input);
    return true;
  } catch {
    return false;
  }
}

