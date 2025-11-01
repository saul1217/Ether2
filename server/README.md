# 🔐 Servidor de Autenticación ENS

## Estructura

```
server/
├── index.js              # Servidor Express principal
├── services/
│   ├── ensValidator.js   # Validación de ENS y firmas
│   └── userService.js    # Gestión de usuarios (en memoria)
└── package.json
```

## Servicios

### ENS Validator (`ensValidator.js`)

Valida que:
1. El nombre ENS existe y tiene un propietario
2. La firma proporcionada corresponde al propietario del ENS
3. El mensaje firmado contiene el nonce y timestamp correctos

### User Service (`userService.js`)

Gestiona:
- Creación automática de usuarios en el primer login
- Recuperación de usuarios existentes
- Almacenamiento en memoria (reemplazar con BD en producción)

## Seguridad

### Protección contra Replay Attacks

- **Nonces únicos**: Cada intento de login requiere un nonce nuevo
- **Expiración**: Nonces expiran después de 10 minutos
- **Uso único**: Los nonces se eliminan después de usarse

### Rate Limiting

- Máximo 10 intentos de autenticación por IP cada 15 minutos
- Protege contra ataques de fuerza bruta

## Variables de Entorno

Crea un archivo `.env` en esta carpeta:

```env
PORT=3001
JWT_SECRET=tu-clave-secreta-super-segura
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

## Notas para Producción

1. **Base de Datos**: Reemplazar `userService.js` con persistencia real
2. **Redis**: Usar Redis para almacenar nonces en lugar de Map
3. **JWT_SECRET**: Generar una clave fuerte y única
4. **Logging**: Implementar logging estructurado
5. **Monitoreo**: Agregar métricas y alertas

