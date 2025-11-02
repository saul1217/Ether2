import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { validateENSLogin } from './services/ensValidator.js';
import { createOrGetUser, getUserByENS } from './services/userService.js';
import { getETHBalance, getENSAvatar, getBalanceInUSD } from './services/ensService.js';
import { resolveENSFromAddress, isEthereumAddress } from './services/ensResolver.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production-' + Date.now();

// Advertencia si no hay JWT_SECRET configurado
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está configurado. Usando valor por defecto para desarrollo.');
  console.warn('⚠️  Para producción, configura JWT_SECRET en el archivo .env');
}

// Configuración CORS - Permite requests desde otros dominios
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : []; // Si no hay configurado, permite todos

// Configuración CORS mejorada
app.use(cors({
  origin: function (origin, callback) {
    // Log para debugging
    console.log(`[CORS] Request desde origin: ${origin || 'sin origin'}`);
    console.log(`[CORS] ALLOWED_ORIGINS configurado: ${process.env.ALLOWED_ORIGINS || 'vacío'}`);
    console.log(`[CORS] allowedOrigins array:`, allowedOrigins);
    
    // Permitir requests sin origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      console.log(`[CORS] ✅ Permitido (sin origin)`);
      return callback(null, true);
    }
    
    // Si no hay origins configurados, está vacío, o contiene '*', permitir todos
    if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS.trim() === '' || allowedOrigins.includes('*')) {
      console.log(`[CORS] ✅ Permitido (ALLOWED_ORIGINS vacío o contiene '*')`);
      return callback(null, true);
    }
    
    // Si hay origins configurados, verificar que esté en la lista
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Permitido (está en la lista)`);
      return callback(null, true);
    }
    
    // Si está en desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CORS] ✅ Permitido (modo desarrollo)`);
      return callback(null, true);
    }
    
    // En producción con origins configurados, rechazar si no está en la lista
    console.log(`[CORS] ❌ Origen rechazado: ${origin}`);
    console.log(`[CORS] Permitidos: ${allowedOrigins.join(', ')}`);
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200 // Para navegadores antiguos
}));

app.use(express.json());

// Rate limiting para prevenir ataques
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests por ventana
  message: 'Demasiados intentos de autenticación, intenta más tarde.'
});

// Almacenamiento en memoria para nonces (en producción usar Redis)
const nonces = new Map();

// Endpoint para obtener un nonce único
app.get('/api/auth/nonce', (req, res) => {
  const nonceBytes = ethers.randomBytes(32);
  const nonce = nonceBytes.toString('hex'); // ✅ Asegurar que es string hexadecimal
  const timestamp = Date.now();
  const timestampString = String(timestamp);
  
  // Logging para debugging
  console.log(`[Nonce Endpoint] Generando nonce:`);
  console.log(`  - Tipo: ${typeof nonce}`);
  console.log(`  - Valor: ${nonce.substring(0, 20)}...`);
  console.log(`  - Longitud: ${nonce.length}`);
  console.log(`  - Es hexadecimal?: ${/^[0-9a-f]+$/i.test(nonce)}`);
  
  // Almacenar nonce con expiración de 10 minutos
  // IMPORTANTE: Guardar el nonce en el formato que el frontend va a enviar
  // Si el frontend recibe el nonce como array y lo convierte a hex,
  // necesitamos guardar ambos formatos o el formato final que recibiremos
  nonces.set(nonce, timestamp);
  
  // También guardar como array serializado (para compatibilidad)
  // ya que parece que JSON.stringify está convirtiendo el string a array
  const nonceArray = Array.from(nonceBytes);
  const nonceArrayKey = nonceArray.join(',');
  nonces.set(nonceArrayKey, timestamp); // Guardar también como array serializado
  
  console.log(`[Nonce Endpoint] Guardado en memoria:`);
  console.log(`  - Como hex: ${nonce} (existe: ${nonces.has(nonce)})`);
  console.log(`  - Como array: ${nonceArrayKey.substring(0, 20)}... (existe: ${nonces.has(nonceArrayKey)})`);
  
  setTimeout(() => {
    nonces.delete(nonce);
    nonces.delete(nonceArrayKey);
  }, 10 * 60 * 1000);
  
  // ✅ IMPORTANTE: El problema es que JSON.stringify está convirtiendo el string a array
  // Vamos a enviar el nonce como array de números para que el frontend lo reciba correctamente
  // y luego el backend lo convertirá de vuelta a hex cuando lo reciba
  const responseData = {
    nonce: Array.from(nonceBytes), // Enviar como array para evitar problemas de serialización
    timestamp: timestampString
  };
  
  console.log(`[Nonce Endpoint] Enviando respuesta:`);
  console.log(`  - Nonce como array: [${Array.from(nonceBytes).slice(0, 5).join(',')}...]`);
  console.log(`  - Timestamp: ${timestampString}`);
  console.log(`  - El frontend debe convertir este array a hex: ${nonce.substring(0, 20)}...`);
  
  // Retornar timestamp como string para consistencia con el mensaje
  res.json(responseData);
});

// Endpoint principal de autenticación ENS
app.post('/api/auth/ens-login', authLimiter, async (req, res) => {
  try {
    const { ensName, signature, nonce, timestamp } = req.body;

    // Validaciones básicas
    if (!ensName || !signature || !nonce || !timestamp) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: ensName, signature, nonce, timestamp' 
      });
    }

    // Logging para debugging
    console.log(`[ENS Login] Recibiendo login:`);
    console.log(`  - ENS: ${ensName}`);
    console.log(`  - Nonce recibido: ${nonce} (tipo: ${typeof nonce}, longitud: ${String(nonce).length})`);
    console.log(`  - Timestamp: ${timestamp}`);
    console.log(`  - Nonces en memoria: ${nonces.size}`);
    
    // ✅ Normalizar nonce si viene como array o string con comas
    let normalizedNonce = nonce;
    let foundNonce = null;
    
    console.log(`[ENS Login] 🔍 Procesando nonce recibido:`);
    console.log(`  - Tipo: ${typeof nonce}`);
    console.log(`  - Es array?: ${Array.isArray(nonce)}`);
    console.log(`  - Valor: ${Array.isArray(nonce) ? `[${nonce.slice(0, 5).join(',')}...]` : String(nonce).substring(0, 30)}`);
    
    if (Array.isArray(nonce)) {
      // Si viene como array [46, 116, 120...]
      normalizedNonce = nonce.map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
      console.log(`[ENS Login] ⚠️ Nonce recibido como array, convertido a hex: ${normalizedNonce.substring(0, 20)}...`);
      
      // También crear el formato con comas para buscar
      const nonceArrayKey = nonce.join(',');
      
      // Buscar en ambos formatos
      if (nonces.has(normalizedNonce)) {
        foundNonce = normalizedNonce;
        console.log(`[ENS Login] ✅ Encontrado como hex normalizado`);
      } else if (nonces.has(nonceArrayKey)) {
        foundNonce = nonceArrayKey;
        normalizedNonce = normalizedNonce; // Mantener el hex para usar después
        console.log(`[ENS Login] ✅ Encontrado como array serializado`);
      }
    } else if (typeof nonce === 'string') {
      if (nonce.includes(',')) {
        // Si viene como "113,79,255..." (array serializado), convertir a hex
        const numbers = nonce.split(',').map(n => parseInt(n.trim(), 10));
        normalizedNonce = numbers.map(n => n.toString(16).padStart(2, '0')).join('');
        console.log(`[ENS Login] ⚠️ Nonce recibido como string con comas, convertido a hex: ${normalizedNonce.substring(0, 20)}...`);
        
        // Buscar en ambos formatos
        if (nonces.has(normalizedNonce)) {
          foundNonce = normalizedNonce;
          console.log(`[ENS Login] ✅ Encontrado como hex normalizado`);
        } else if (nonces.has(nonce)) {
          foundNonce = nonce;
          console.log(`[ENS Login] ✅ Encontrado como string con comas`);
        }
      } else {
        // Ya es string hexadecimal
        normalizedNonce = nonce.trim();
        console.log(`[ENS Login] Nonce recibido como string hex: ${normalizedNonce.substring(0, 20)}...`);
        
        // Buscar directamente
        if (nonces.has(normalizedNonce)) {
          foundNonce = normalizedNonce;
          console.log(`[ENS Login] ✅ Encontrado como hex directo`);
        }
      }
    } else {
      normalizedNonce = String(nonce);
    }
    
    // Asegurar que normalizedNonce es string antes de usar substring
    const normalizedNonceStr = typeof normalizedNonce === 'string' ? normalizedNonce : String(normalizedNonce);
    
    console.log(`[ENS Login] Nonce final para usar: ${normalizedNonceStr.substring(0, 20)}...`);
    console.log(`[ENS Login] Verificando en memoria...`);
    console.log(`  - ¿Existe nonce original?: ${nonces.has(nonce)}`);
    console.log(`  - ¿Existe nonce normalizado (hex)?: ${nonces.has(normalizedNonceStr)}`);
    console.log(`  - Total nonces en memoria: ${nonces.size}`);
    
    // Si todavía no se encontró, intentar buscar el hex en todos los nonces
    if (!foundNonce && !nonces.has(normalizedNonceStr)) {
      // Buscar el nonce hex en todos los nonces guardados
      // (puede estar guardado como hex pero buscamos con otro formato)
      for (const [storedKey, storedTimestamp] of nonces.entries()) {
        let storedAsHex = null;
        
        // Si está guardado como array serializado, convertirlo a hex
        if (typeof storedKey === 'string' && storedKey.includes(',')) {
          const numbers = storedKey.split(',').map(n => parseInt(n.trim(), 10));
          storedAsHex = numbers.map(n => n.toString(16).padStart(2, '0')).join('');
        } else if (typeof storedKey === 'string' && /^[0-9a-f]+$/i.test(storedKey)) {
          storedAsHex = storedKey;
        }
        
        // Comparar el hex normalizado con el hex del nonce guardado
        if (storedAsHex && storedAsHex.toLowerCase() === normalizedNonceStr.toLowerCase()) {
          foundNonce = storedKey; // Usar la clave original guardada
          console.log(`[ENS Login] ✅ Encontrado! El hex coincide con nonce guardado como: ${typeof storedKey === 'string' ? storedKey.substring(0, 30) + '...' : '[Array]'}`);
          break;
        }
      }
    }
    
    // Si todavía no se encontró después de todas las búsquedas
    if (!foundNonce && !nonces.has(normalizedNonceStr)) {
      const availableNonces = Array.from(nonces.keys()).slice(0, 5);
      console.error(`[ENS Login] ❌ Nonce no encontrado después de búsqueda exhaustiva.`);
      console.error(`  - Nonce recibido: ${Array.isArray(nonce) ? `[Array de ${nonce.length} elementos]` : String(nonce).substring(0, 50)}`);
      console.error(`  - Nonce normalizado (hex): ${normalizedNonceStr.substring(0, 20)}...`);
      console.error(`  - Total nonces en memoria: ${nonces.size}`);
      console.error(`  - Nonces disponibles (primeros 5):`);
      availableNonces.forEach((key, i) => {
        const preview = typeof key === 'string' 
          ? (key.length > 30 ? key.substring(0, 30) + '...' : key)
          : `[Array de ${Array.isArray(key) ? key.length : 'unknown'} elementos]`;
        console.error(`    ${i + 1}. ${preview} (tipo: ${typeof key})`);
      });
      return res.status(400).json({ error: 'Nonce inválido o expirado. Asegúrate de obtener un nonce nuevo antes de hacer login.' });
    }
    
    // Usar el nonce encontrado o el normalizado
    const finalNonce = foundNonce || normalizedNonceStr;

    // Verificar que el timestamp no es muy antiguo (max 10 minutos)
    // Convertir timestamp a número si viene como string
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const now = Date.now();
    if (isNaN(timestampNum) || now - timestampNum > 10 * 60 * 1000) {
      nonces.delete(finalNonce);
      if (nonce !== finalNonce && nonces.has(nonce)) {
        nonces.delete(nonce);
      }
      return res.status(400).json({ error: 'Timestamp expirado' });
    }

    // Eliminar el nonce usado (protección contra replay)
    nonces.delete(finalNonce);
    // También eliminar en otros formatos si existen
    if (Array.isArray(nonce)) {
      const arrayKey = nonce.join(',');
      if (nonces.has(arrayKey) && arrayKey !== finalNonce) {
        nonces.delete(arrayKey);
      }
    }
    if (typeof nonce === 'string' && nonce !== finalNonce && nonces.has(nonce)) {
      nonces.delete(nonce);
    }
    // Eliminar también el formato hex si existe
    if (normalizedNonceStr !== finalNonce && nonces.has(normalizedNonceStr)) {
      nonces.delete(normalizedNonceStr);
    }

    // Asegurar que nonce y timestamp sean strings para consistencia
    // IMPORTANTE: Siempre usar el hex normalizado para la validación ENS
    // porque el mensaje fue firmado con ese hex
    let nonceString;
    
    // Siempre usar normalizedNonceStr que ya es string
    if (/^[0-9a-f]+$/i.test(normalizedNonceStr)) {
      nonceString = normalizedNonceStr; // Usar el hex normalizado (el que se usó para firmar)
    } else if (typeof finalNonce === 'string' && /^[0-9a-f]+$/i.test(finalNonce)) {
      nonceString = finalNonce;
    } else if (Array.isArray(nonce)) {
      // Convertir array a hex nuevamente para asegurar
      nonceString = nonce.map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
    } else {
      nonceString = normalizedNonceStr;
    }
    const timestampString = String(timestamp);
    
    console.log(`[ENS Login] Validando con nonce: ${nonceString.substring(0, 20)}...`);

    // ESTRATEGIA: Resolver ENS ANTES de validar si es necesario
    // Si ensName es una dirección, el frontend probablemente envió la dirección del wallet
    // pero el mensaje fue firmado con el ENS real. Necesitamos resolver el ENS primero.
    
    let finalENSName = ensName;
    
    // Si ensName es una dirección, intentar resolver el ENS desde esa dirección
    if (isEthereumAddress(ensName)) {
      console.log(`[ENS Login] ⚠️ ensName recibido es una dirección: ${ensName}`);
      console.log(`[ENS Login] Intentando resolver ENS desde esta dirección...`);
      
      const resolved = await resolveENSFromAddress(ensName);
      if (resolved) {
        finalENSName = resolved;
        console.log(`[ENS Login] ✅ ENS resuelto desde dirección: ${finalENSName}`);
      } else {
        // Si no se puede resolver, el mensaje fue firmado con el ENS real (no la dirección)
        // Necesitamos intentar validar, pero puede que el mensaje tenga el ENS, no la dirección
        console.log(`[ENS Login] ⚠️ No se pudo resolver ENS desde dirección ${ensName}`);
        console.log(`[ENS Login] ⚠️ El mensaje probablemente fue firmado con el ENS real, no con la dirección`);
        // Continuar con validación - puede fallar si el mensaje tiene el ENS
      }
    }

    // Normalizar ENS name si es válido (asegurar que termine en .eth)
    if (finalENSName && !isEthereumAddress(finalENSName)) {
      if (!finalENSName.toLowerCase().endsWith('.eth')) {
        finalENSName = `${finalENSName.toLowerCase()}.eth`;
      } else {
        finalENSName = finalENSName.toLowerCase();
      }
    }

    // Validar ENS y firma con el ENS final (puede ser el original o el resuelto)
    let validation;
    try {
      console.log(`[ENS Login] Llamando a validateENSLogin con ENS: ${finalENSName}...`);
      validation = await validateENSLogin(finalENSName, signature, nonceString, timestampString);
      console.log(`[ENS Login] Resultado de validación:`, {
        isValid: validation.isValid,
        error: validation.error || 'N/A',
        address: validation.address || 'N/A'
      });
    } catch (validationError) {
      console.error(`[ENS Login] ❌ Error en validateENSLogin:`, validationError);
      return res.status(500).json({ 
        error: 'Error validando ENS y firma',
        message: process.env.NODE_ENV === 'development' ? validationError.message : undefined
      });
    }
    
    if (!validation.isValid) {
      // Si la validación falló y ensName original era una dirección,
      // intentar resolver el ENS desde la dirección validada (de la firma)
      if (isEthereumAddress(ensName) && validation.address) {
        console.log(`[ENS Login] ⚠️ Validación falló. Intentando resolver ENS desde dirección validada: ${validation.address}`);
        const resolvedFromValidated = await resolveENSFromAddress(validation.address);
        if (resolvedFromValidated) {
          console.log(`[ENS Login] ✅ ENS encontrado: ${resolvedFromValidated}. Reintentando validación...`);
          // Reintentar validación con el ENS resuelto
          const retryValidation = await validateENSLogin(resolvedFromValidated, signature, nonceString, timestampString);
          if (retryValidation.isValid) {
            validation = retryValidation;
            finalENSName = resolvedFromValidated;
            console.log(`[ENS Login] ✅ Validación exitosa con ENS resuelto: ${finalENSName}`);
          } else {
            return res.status(401).json({ error: validation.error });
          }
        } else {
          return res.status(401).json({ error: validation.error });
        }
      } else {
        return res.status(401).json({ error: validation.error });
      }
    }

    // Si después de validar, el ENS todavía es una dirección o no se resolvió correctamente,
    // intentar resolver desde la dirección validada (la que firmó el mensaje)
    if (isEthereumAddress(finalENSName) || (finalENSName === ensName && isEthereumAddress(ensName))) {
      console.log(`[ENS Login] Después de validar, intentando resolver ENS desde dirección validada: ${validation.address}`);
      const resolved = await resolveENSFromAddress(validation.address);
      if (resolved) {
        finalENSName = resolved;
        console.log(`[ENS Login] ✅ ENS resuelto después de validar: ${finalENSName}`);
      } else {
        console.log(`[ENS Login] ⚠️ No hay ENS asociado a la dirección validada. Usando dirección: ${validation.address}`);
        finalENSName = validation.address;
      }
    }

    // Crear o obtener usuario
    let user;
    try {
      console.log(`[ENS Login] Creando/obteniendo usuario con ENS: ${finalENSName}...`);
      user = await createOrGetUser(finalENSName, validation.address);
      console.log(`[ENS Login] Usuario:`, { 
        id: user.id, 
        ensName: user.ensName, 
        address: user.address,
        finalENSName: finalENSName,
        ensNameEsDireccion: isEthereumAddress(user.ensName)
      });
      
      // Si el usuario existía y tenía valores incorrectos, actualizar
      // IMPORTANTE: Asegurar que user.address sea validation.address (la que firmó)
      if (user.address.toLowerCase() !== validation.address.toLowerCase()) {
        console.log(`[ENS Login] ⚠️ Dirección del usuario no coincide. Actualizando:`);
        console.log(`  - Antes: ${user.address}`);
        console.log(`  - Después: ${validation.address}`);
        user.address = ethers.getAddress(validation.address); // Checksum
      }
      
      // Si el usuario existía y tenía una dirección como ensName, pero ahora tenemos el ENS resuelto,
      // actualizar el usuario con el ENS real
      if (isEthereumAddress(user.ensName) && !isEthereumAddress(finalENSName)) {
        console.log(`[ENS Login] ⚠️ Usuario existía con dirección como ensName. Actualizando a ENS: ${finalENSName}`);
        user.ensName = finalENSName;
      }
    } catch (userError) {
      console.error(`[ENS Login] ❌ Error creando/obteniendo usuario:`, userError);
      return res.status(500).json({ 
        error: 'Error creando usuario',
        message: process.env.NODE_ENV === 'development' ? userError.message : undefined
      });
    }

    // Obtener información adicional: balance de ETH y avatar
    console.log(`[ENS Login] Obteniendo información adicional...`);
    let ethBalance = '0.0';
    let balanceUSD = 0;
    let avatar = null;

    try {
      ethBalance = await getETHBalance(validation.address);
      console.log(`[ENS Login] Balance ETH: ${ethBalance}`);
      
      // Calcular valor en USD
      balanceUSD = await getBalanceInUSD(ethBalance);
      console.log(`[ENS Login] Balance USD: $${balanceUSD.toFixed(2)}`);
    } catch (balanceError) {
      console.error(`[ENS Login] ⚠️ Error obteniendo balance:`, balanceError.message);
      // Continuar con balance por defecto
    }

    try {
      // Usar el ENS resuelto (finalENSName) para obtener avatar, no user.ensName
      if (finalENSName && !isEthereumAddress(finalENSName)) {
        avatar = await getENSAvatar(finalENSName);
        console.log(`[ENS Login] Avatar: ${avatar || 'No disponible'}`);
      } else {
        console.log(`[ENS Login] ⚠️ No hay ENS name válido para obtener avatar (finalENSName: ${finalENSName})`);
        avatar = null;
      }
    } catch (avatarError) {
      console.error(`[ENS Login] ⚠️ Error obteniendo avatar:`, avatarError.message);
      // Continuar sin avatar
    }

    // Generar JWT
    let token;
    try {
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
      }
      console.log(`[ENS Login] Generando JWT...`);
      // Usar el ENS resuelto en el JWT, no user.ensName (que puede ser dirección)
      const ensForJWT = finalENSName || user.ensName;
      token = jwt.sign(
        { 
          ensName: ensForJWT, 
          address: user.address,
          userId: user.id 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log(`[ENS Login] ✅ Token generado exitosamente`);
    } catch (jwtError) {
      console.error(`[ENS Login] ❌ Error generando JWT:`, jwtError);
      return res.status(500).json({ 
        error: 'Error generando token',
        message: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }

    // Asegurar que estamos usando el ENS resuelto y la dirección correcta
    // IMPORTANTE: validation.address es la dirección que firmó el mensaje (la correcta)
    // finalENSName es el ENS resuelto (o dirección si no hay ENS)
    const finalENSForResponse = (!isEthereumAddress(finalENSName)) ? finalENSName : null;
    const finalAddressForResponse = validation.address; // Siempre usar la dirección que firmó
    
    console.log(`[ENS Login] 📤 Preparando respuesta:`);
    console.log(`  - ENS final: ${finalENSForResponse || '(null, no hay ENS)'}`);
    console.log(`  - Address final: ${finalAddressForResponse}`);
    console.log(`  - user.ensName actual: ${user.ensName}`);
    console.log(`  - user.address actual: ${user.address}`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        ensName: finalENSForResponse,      // ENS name real (null si no hay, NO dirección)
        address: finalAddressForResponse,  // Dirección que firmó (validation.address)
        balance: ethBalance,        // Balance en ETH
        balanceUSD: balanceUSD,     // Valor en USD
        avatar: avatar || null,     // URL del avatar de ENS (siempre presente, null si no tiene)
        createdAt: user.createdAt
      },
      // Campos destacados para fácil acceso
      ensName: finalENSForResponse,        // Usar el ENS resuelto (o null)
      avatar: avatar || null
    });

  } catch (error) {
    console.error('❌ Error en autenticación ENS:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Stack:', error.stack);
    console.error('  - Tipo:', error.constructor.name);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check - Para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ENS Authentication API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      nonce: '/api/auth/nonce',
      login: '/api/auth/ens-login',
      verify: '/api/auth/verify'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ENS Authentication API',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para verificar token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserByENS(decoded.ensName);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si el user.ensName es una dirección, intentar resolver el ENS real
    let finalENSName = user.ensName;
    if (isEthereumAddress(user.ensName)) {
      console.log(`[Verify] ensName es una dirección, intentando resolver ENS desde: ${user.address}`);
      const resolved = await resolveENSFromAddress(user.address);
      if (resolved) {
        finalENSName = resolved;
        console.log(`[Verify] ✅ ENS resuelto: ${finalENSName}`);
        // Actualizar el usuario con el ENS resuelto si es diferente
        if (user.ensName !== finalENSName) {
          user.ensName = finalENSName;
          console.log(`[Verify] Usuario actualizado con ENS resuelto`);
        }
      } else {
        console.log(`[Verify] ⚠️ No se pudo resolver ENS, será null`);
        finalENSName = null; // Si no hay ENS, devolver null, no dirección
      }
    }
    
    // Asegurar que finalENSName no sea una dirección
    if (isEthereumAddress(finalENSName)) {
      finalENSName = null;
      console.log(`[Verify] ⚠️ finalENSName es dirección, estableciendo a null`);
    }

    // Obtener información actualizada: balance y avatar
    let ethBalance = '0.0';
    let balanceUSD = 0;
    let avatar = null;

    try {
      ethBalance = await getETHBalance(user.address);
      balanceUSD = await getBalanceInUSD(ethBalance);
    } catch (error) {
      console.error(`[Verify] Error obteniendo balance:`, error.message);
    }

    try {
      // Usar el ENS resuelto para obtener el avatar
      if (finalENSName && !isEthereumAddress(finalENSName)) {
        avatar = await getENSAvatar(finalENSName);
      } else {
        console.log(`[Verify] ⚠️ No hay ENS válido para obtener avatar`);
        avatar = null;
      }
    } catch (error) {
      console.error(`[Verify] Error obteniendo avatar:`, error.message);
      avatar = null;
    }

    // Asegurar que ensName no sea una dirección
    const finalENSForResponse = (!isEthereumAddress(finalENSName) && finalENSName) ? finalENSName : null;
    const finalAddressForResponse = user.address; // La dirección del usuario guardada
    
    console.log(`[Verify] 📤 Preparando respuesta:`);
    console.log(`  - ENS final: ${finalENSForResponse || '(null, no hay ENS)'}`);
    console.log(`  - Address final: ${finalAddressForResponse}`);
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        ensName: finalENSForResponse,      // ENS name real (null si no hay, NO dirección)
        address: finalAddressForResponse,  // Dirección del usuario
        balance: ethBalance,
        balanceUSD: balanceUSD,
        avatar: avatar || null,     // URL del avatar de ENS (siempre presente, null si no tiene)
        createdAt: user.createdAt
      },
      // Campos destacados para fácil acceso
      ensName: finalENSForResponse,        // Usar el ENS resuelto (o null)
      avatar: avatar || null
    });

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Middleware de manejo de errores global (debe ir ANTES de app.listen)
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  console.error('  - Mensaje:', err.message);
  console.error('  - Stack:', err.stack);
  console.error('  - URL:', req.url);
  console.error('  - Method:', req.method);
  
  // Si es error de CORS, devolver 403 en lugar de 500
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      error: 'No permitido por CORS',
      message: `El origen ${req.headers.origin || 'desconocido'} no está permitido.`,
      allowedOrigins: process.env.ALLOWED_ORIGINS || '*'
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/auth/nonce',
      'POST /api/auth/ens-login',
      'GET /api/auth/verify'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   GET  /                      - Información del servicio`);
  console.log(`   GET  /api/health            - Health check`);
  console.log(`   GET  /api/auth/nonce        - Obtener nonce`);
  console.log(`   POST /api/auth/ens-login    - Autenticar con ENS`);
  console.log(`   GET  /api/auth/verify       - Verificar token`);
  console.log(`\n🔧 Configuración:`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || 'vacío (permite todos)'}`);
  console.log(`   - CORS: ${process.env.ALLOWED_ORIGINS === '*' ? 'Permite todos' : 'Configurado'}`);
});

