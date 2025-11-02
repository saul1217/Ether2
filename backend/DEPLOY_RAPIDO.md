# ⚡ Deploy Rápido del Backend como API

## 🚀 Pasos Rápidos (5 minutos)

### 1. Preparar Variables de Entorno

Crea `backend/.env`:

```env
PORT=3001
JWT_SECRET=genera-una-clave-secreta-aleatoria-minimo-32-caracteres
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ALLOWED_ORIGINS=*
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Genera un `JWT_SECRET` seguro:
```bash
# En PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# O usa: openssl rand -hex 32
```

### 2. Deploy en Render.com (Recomendado)

1. Ve a [render.com](https://render.com) y crea cuenta
2. Click "New +" → "Web Service"
3. Conecta tu repositorio Git
4. Configuración:
   ```
   Name: ens-auth-api
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && node index.js
   ```
5. Variables de entorno:
   - `JWT_SECRET` = (tu clave secreta)
   - `ETHEREUM_RPC_URL` = `https://eth.llamarpc.com`
   - `ALLOWED_ORIGINS` = `*`
   - `NODE_ENV` = `production`
6. Click "Create Web Service"
7. ✅ Tu API estará en: `https://tu-servicio.onrender.com`

### 3. Verificar que Funciona

```bash
curl https://tu-servicio.onrender.com/api/health
```

Debe responder con:
```json
{"status":"ok","service":"ENS Authentication API","timestamp":"..."}
```

---

## 🔗 Usar la API desde otra Página

### Ejemplo Básico:

```javascript
const API_URL = 'https://tu-servicio.onrender.com';

// 1. Obtener nonce
const { nonce, timestamp } = await fetch(`${API_URL}/api/auth/nonce`)
  .then(r => r.json());

// 2. Login (después de firmar con wallet)
const result = await fetch(`${API_URL}/api/auth/ens-login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ensName: 'usuario.eth',
    signature: '0x...',
    nonce: 'hex-string',
    timestamp
  })
}).then(r => r.json());

// 3. Guardar token
localStorage.setItem('ensAuthToken', result.token);
```

---

## 📚 Documentación Completa

- **Guía completa de deploy:** `docs/DEPLOY_API_PRODUCCION.md`
- **Cómo usar la API:** `docs/COMO_USAR_API_REMOTA.md`

---

## ✅ Checklist Post-Deploy

- [ ] API responde en `/api/health`
- [ ] Puedes obtener nonce desde `/api/auth/nonce`
- [ ] CORS permite peticiones desde tu dominio
- [ ] Variables de entorno configuradas correctamente
- [ ] `JWT_SECRET` es una clave segura y única

---

¡Listo! Tu API está disponible para ser usada desde cualquier página web. 🌐

