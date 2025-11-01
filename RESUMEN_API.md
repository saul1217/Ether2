# 📋 Resumen Rápido: API Remota

## 🎯 Para Ti (Quien Expone la API)

1. **Despliega tu backend** siguiendo `DEPLOY_API.md`
2. **Obtienes una URL** como: `https://ens-auth.railway.app/api`
3. **Comparte con tu amigo:**
   - La URL de tu API
   - El archivo `API_DOCS.md`
   - El componente `LoginWithENSRemote.jsx`

## 🎯 Para tu Amigo (Quien Usa la API)

1. **Copia el componente** `LoginWithENSRemote.jsx`
2. **Instala ethers**: `npm install ethers`
3. **Usa el componente:**
   ```jsx
   import LoginWithENSRemote from './components/LoginWithENSRemote';
   
   <LoginWithENSRemote 
     apiUrl="https://ens-auth.railway.app/api"
     onLoginSuccess={(token, user) => {
       localStorage.setItem('ensAuthToken', token);
       console.log('Usuario:', user);
     }}
   />
   ```
4. **¡Listo!** Ya tiene login con ENS funcionando

## 📝 Endpoints Disponibles

- `GET /api/auth/nonce` - Obtener nonce único
- `POST /api/auth/ens-login` - Autenticar usuario
- `GET /api/auth/verify` - Verificar token JWT

Ver `API_DOCS.md` para documentación completa.

## 🔒 Seguridad

- CORS configurado para permitir dominios específicos
- Rate limiting: 10 intentos por IP cada 15 minutos
- JWT tokens con expiración de 7 días

## ✅ Checklist

### Tu lado (Exponer API):
- [ ] Backend desplegado
- [ ] CORS configurado
- [ ] Variables de entorno configuradas
- [ ] URL compartida con tu amigo
- [ ] Documentación compartida (`API_DOCS.md`)

### Lado de tu amigo (Usar API):
- [ ] Componente copiado
- [ ] ethers.js instalado
- [ ] URL de API configurada
- [ ] Probado el login

---

**¡Eso es todo!** Tu amigo puede usar tu API desde su página web sin instalar nada más. 🚀

