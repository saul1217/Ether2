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
    // Actualizar dirección si ha cambiado
    if (existingUser.address.toLowerCase() !== address.toLowerCase()) {
      existingUser.address = address;
      existingUser.updatedAt = new Date().toISOString();
    }
    return existingUser;
  }

  // Crear nuevo usuario
  const newUser = {
    id: userIdCounter++,
    ensName,
    address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

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

