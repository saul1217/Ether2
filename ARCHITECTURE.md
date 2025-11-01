# 🏗️ Arquitectura del Sistema

## Flujo de Autenticación

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│ Usuario │         │ Frontend │         │ Backend  │
└────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                     │
     │  1. Click Login  │                     │
     ├──────────────────>│                     │
     │                   │  2. Request Nonce   │
     │                   ├────────────────────>│
     │                   │  3. Return Nonce    │
     │                   │<────────────────────┤
     │                   │                     │
     │  4. Connect Wallet│                     │
     ├──────────────────>│                     │
     │                   │                     │
     │  5. Sign Message  │                     │
     ├──────────────────>│                     │
     │  6. Signature     │                     │
     │<──────────────────┤                     │
     │                   │  7. Login Request   │
     │                   │  (ENS, sig, nonce)  │
     │                   ├────────────────────>│
     │                   │                     │─┐
     │                   │                     │ │ 8. Validate ENS
     │                   │                     │ │    & Signature
     │                   │                     │<┘
     │                   │                     │
     │                   │  9. Create/Get User │
     │                   │     & Generate JWT  │
     │                   │                     │
     │                   │ 10. Return Token    │
     │                   │<────────────────────┤
     │  11. Save Token   │                     │
     │<──────────────────┤                     │
     │                   │                     │
```

## Componentes

### Frontend (React)

**Componentes principales:**
- `App.jsx`: Componente raíz, maneja estado de autenticación
- `LoginWithENS.jsx`: Componente de login con integración wallet
- `Dashboard.jsx`: Panel de usuario autenticado

**Bibliotecas:**
- `ethers.js`: Interacción con blockchain y wallets
- `axios`: Llamadas HTTP al backend

### Backend (Node.js/Express)

**Endpoints:**
- `GET /api/auth/nonce`: Genera nonce único
- `POST /api/auth/ens-login`: Valida y autentica
- `GET /api/auth/verify`: Verifica token JWT

**Servicios:**
- `ensValidator.js`: Validación de ENS y firmas
- `userService.js`: Gestión de usuarios

## Seguridad

### Protección contra Replay Attacks

1. **Nonce único por solicitud**
   - Generado por el servidor
   - Incluido en el mensaje a firmar
   - Eliminado después de usar

2. **Timestamp de expiración**
   - Mensaje válido por 10 minutos
   - Verificación en backend

3. **Validación de ENS**
   - Verifica ownership en blockchain
   - Compara dirección firmante con owner del ENS

### Almacenamiento

**Desarrollo (actual):**
- Nonces: Map en memoria
- Usuarios: Map en memoria

**Producción (recomendado):**
- Nonces: Redis con TTL
- Usuarios: Base de datos (PostgreSQL/MongoDB)

## Integración con Blockchain

### ENS Resolution

```
ENS Name → namehash → ENS Registry → Owner Address
                                    ↓
                              Compare with
                                    ↓
                         Signature Recovery Address
```

### Validación de Propiedad

1. Resolver ENS name a owner address
2. Recuperar dirección de la firma
3. Comparar ambas direcciones
4. Verificar que coinciden

## Extensibilidad

### Para otras plataformas Web2

El módulo puede integrarse en:

- **Blogs**: WordPress plugin, Ghost theme
- **Foros**: Discourse plugin, phpBB module
- **Tiendas**: Shopify app, WooCommerce plugin
- **CMS**: Drupal module, Joomla plugin

### Para otras blockchains

Puede extenderse para:
- Solana Name Service (SNS)
- Unstoppable Domains
- Cualquier servicio de nombres en blockchain

## Consideraciones de Rendimiento

- **Caching**: Cachear resoluciones ENS
- **Rate Limiting**: Ya implementado
- **Connection Pooling**: Para RPC providers
- **CDN**: Para assets estáticos del frontend

