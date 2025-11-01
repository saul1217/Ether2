import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { validateENSLogin } from './services/ensValidator.js';
import { createOrGetUser, getUserByENS } from './services/userService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configuración CORS - Permite requests desde otros dominios
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173']; // Defaults para desarrollo

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Si hay origins configurados, verificar
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      // En desarrollo, permitir cualquier origen (cambiar en producción)
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('No permitido por CORS'));
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
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
  const nonce = ethers.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const timestampString = String(timestamp);
  
  // Almacenar nonce con expiración de 10 minutos
  // Guardamos como string para consistencia
  nonces.set(nonce, timestamp);
  setTimeout(() => nonces.delete(nonce), 10 * 60 * 1000);
  
  // Retornar timestamp como string para consistencia con el mensaje
  res.json({ nonce, timestamp: timestampString });
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

    // Verificar que el nonce existe y no ha expirado
    if (!nonces.has(nonce)) {
      return res.status(400).json({ error: 'Nonce inválido o expirado' });
    }

    // Verificar que el timestamp no es muy antiguo (max 10 minutos)
    // Convertir timestamp a número si viene como string
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const now = Date.now();
    if (isNaN(timestampNum) || now - timestampNum > 10 * 60 * 1000) {
      nonces.delete(nonce);
      return res.status(400).json({ error: 'Timestamp expirado' });
    }

    // Eliminar el nonce usado (protección contra replay)
    nonces.delete(nonce);

    // Asegurar que nonce y timestamp sean strings para consistencia
    const nonceString = String(nonce);
    const timestampString = String(timestamp);

    // Validar ENS y firma
    const validation = await validateENSLogin(ensName, signature, nonceString, timestampString);
    
    if (!validation.isValid) {
      return res.status(401).json({ error: validation.error });
    }

    // Crear o obtener usuario
    const user = await createOrGetUser(ensName, validation.address);

    // Generar JWT
    const token = jwt.sign(
      { 
        ensName: user.ensName, 
        address: user.address,
        userId: user.id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        ensName: user.ensName,
        address: user.address,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error en autenticación ENS:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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

    res.json({
      valid: true,
      user: {
        id: user.id,
        ensName: user.ensName,
        address: user.address,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   GET  /api/auth/nonce`);
  console.log(`   POST /api/auth/ens-login`);
  console.log(`   GET  /api/auth/verify`);
});

