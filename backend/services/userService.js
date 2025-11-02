import { ethers } from 'ethers';

// Almacenamiento en memoria (en producción usar base de datos)
const users = new Map();
let userIdCounter = 1;

/**
 * Crea un nuevo usuario o devuelve uno existente
 */
export async function createOrGetUser(ensName, address) {
  // Buscar usuario existente por ENS name
  const existingUser = Array.from(users.values()).find(
    user => user.ensName.toLowerCase() === ensName.toLowerCase()
  );

  if (existingUser) {
    // Actualizar dirección si ha cambiado (normalizar a checksum)
    const normalizedExisting = existingUser.address.toLowerCase();
    const normalizedNew = address.toLowerCase();
    if (normalizedExisting !== normalizedNew) {
      // Usar getAddress para asegurar checksum correcto
      existingUser.address = ethers.getAddress(address);
      existingUser.updatedAt = new Date().toISOString();
      console.log(`[User Service] Dirección actualizada para ${ensName}: ${existingUser.address}`);
    }
    return existingUser;
  }

  // Crear nuevo usuario - asegurar checksum correcto
  const checksummedAddress = ethers.getAddress(address);
  const newUser = {
    id: userIdCounter++,
    ensName,
    address: checksummedAddress, // Usar dirección con checksum correcto
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`[User Service] Nuevo usuario creado: ${ensName} -> ${checksummedAddress}`);
  users.set(newUser.id, newUser);
  return newUser;
}

/**
 * Obtiene un usuario por su nombre ENS
 */
export async function getUserByENS(ensName) {
  const user = Array.from(users.values()).find(
    user => user.ensName.toLowerCase() === ensName.toLowerCase()
  );
  return user || null;
}

/**
 * Obtiene un usuario por su ID
 */
export async function getUserById(id) {
  return users.get(id) || null;
}

