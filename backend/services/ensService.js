import { ethers } from 'ethers';
import https from 'https';
import { URL } from 'url';

// Provider para Ethereum Mainnet
const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
);

/**
 * Obtiene el precio actual de ETH en USD
 * @returns {Promise<number>} Precio de ETH en USD
 */
export async function getETHPrice() {
  // Verificar si hay un precio en caché y no ha expirado
  const now = Date.now();
  if (ethPriceCache.price && (now - ethPriceCache.timestamp) < CACHE_DURATION) {
    console.log(`[ENS Service] Usando precio en caché: $${ethPriceCache.price}`);
    return ethPriceCache.price;
  }

  try {
    // Usar CoinGecko API (gratuita, no requiere API key)
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.ethereum && json.ethereum.usd) {
              const price = json.ethereum.usd;
              ethPriceCache = {
                price: price,
                timestamp: Date.now()
              };
              console.log(`[ENS Service] Precio de ETH obtenido: $${price}`);
              resolve(price);
            } else {
              console.error(`[ENS Service] Respuesta inesperada de CoinGecko:`, json);
              // Si falla, usar precio por defecto (último precio conocido aproximado)
              resolve(ethPriceCache.price || 2500);
            }
          } catch (error) {
            console.error(`[ENS Service] Error parseando respuesta de precio:`, error);
            resolve(ethPriceCache.price || 2500);
          }
        });
      }).on('error', (error) => {
        console.error(`[ENS Service] Error obteniendo precio de ETH:`, error.message);
        // Si falla, usar precio en caché o precio por defecto
        resolve(ethPriceCache.price || 2500);
      });
    });
  } catch (error) {
    console.error(`[ENS Service] Error en getETHPrice:`, error);
    return ethPriceCache.price || 2500;
  }
}

/**
 * Obtiene el balance de ETH de una dirección
 * @param {string} address - Dirección Ethereum (con checksum)
 * @returns {Promise<string>} Balance en ETH como string
 */
export async function getETHBalance(address) {
  try {
    const balance = await provider.getBalance(address);
    // Convertir de wei a ETH
    const balanceInETH = ethers.formatEther(balance);
    return balanceInETH;
  } catch (error) {
    console.error(`[ENS Service] Error obteniendo balance para ${address}:`, error);
    return '0.0';
  }
}

/**
 * Calcula el valor en USD de un balance de ETH
 * @param {string} balanceETH - Balance en ETH (string)
 * @returns {Promise<number>} Valor en USD
 */
export async function getBalanceInUSD(balanceETH) {
  try {
    const ethPrice = await getETHPrice();
    const balance = parseFloat(balanceETH);
    const valueUSD = balance * ethPrice;
    return valueUSD;
  } catch (error) {
    console.error(`[ENS Service] Error calculando valor en USD:`, error);
    return 0;
  }
}

/**
 * Verifica si una URL existe haciendo una petición HEAD
 * @param {string} urlString - URL a verificar
 * @returns {Promise<boolean>} true si la URL existe
 */
function checkUrlExists(urlString) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlString);
      const options = {
        method: 'HEAD',
        timeout: 3000
      };

      const req = https.request(url, options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Obtiene el avatar de ENS de un nombre ENS o dirección
 * @param {string} ensName - Nombre ENS (ej: "saul12.eth") o dirección Ethereum
 * @returns {Promise<string|null>} URL del avatar o null si no tiene
 */
export async function getENSAvatar(ensName) {
  try {
    // Si es una dirección, no podemos obtener avatar directamente
    if (/^0x[a-fA-F0-9]{40}$/.test(ensName)) {
      console.log(`[ENS Service] Input es una dirección, no se puede obtener avatar directo`);
      return null;
    }

    const normalizedENS = ensName.toLowerCase().endsWith('.eth') 
      ? ensName.toLowerCase() 
      : `${ensName.toLowerCase()}.eth`;

    // Intentar obtener el avatar usando el resolver de ENS
    const resolver = await provider.getResolver(normalizedENS);
    
    if (!resolver) {
      console.log(`[ENS Service] No hay resolver para ${normalizedENS}`);
      // Usar URL de fallback directamente
      return `https://metadata.ens.domains/mainnet/avatar/${normalizedENS}`;
    }

    // Intentar obtener el avatar del resolver
    try {
      const avatar = await resolver.getAvatar();
      if (avatar && avatar.url) {
        console.log(`[ENS Service] Avatar encontrado para ${normalizedENS}: ${avatar.url}`);
        return avatar.url;
      }
    } catch (error) {
      console.log(`[ENS Service] No se pudo obtener avatar del resolver: ${error.message}`);
    }

    // Fallback: usar el servicio público de ENS
    // Formato: https://metadata.ens.domains/mainnet/avatar/{ensName}
    const fallbackUrl = `https://metadata.ens.domains/mainnet/avatar/${normalizedENS}`;
    console.log(`[ENS Service] Usando URL de fallback para avatar: ${fallbackUrl}`);
    
    // Retornar la URL de fallback (siempre devolver algo, el frontend manejará si no existe)
    return fallbackUrl;

  } catch (error) {
    console.error(`[ENS Service] Error obteniendo avatar para ${ensName}:`, error);
    // Retornar URL de fallback incluso en caso de error
    const normalizedENS = ensName.toLowerCase().endsWith('.eth') 
      ? ensName.toLowerCase() 
      : `${ensName.toLowerCase()}.eth`;
    return `https://metadata.ens.domains/mainnet/avatar/${normalizedENS}`;
  }
}

