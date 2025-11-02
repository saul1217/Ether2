# 🚀 Alternativas Gratuitas para Desplegar tu API

Si Railway está limitado, aquí tienes otras opciones completamente gratuitas:

## ✅ Opción 1: Render.com (Muy Fácil, Gratis) ⭐ RECOMENDADO

**Ventajas:**
- ✅ Gratis para siempre
- ✅ Despliega Node.js sin problemas
- ✅ HTTPS automático
- ✅ Muy fácil de configurar

### Pasos:

1. **Crear cuenta en [render.com](https://render.com)**
   - Sign up con GitHub

2. **Nuevo Web Service:**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub (o sube el código)
   - Selecciona el repositorio

3. **Configuración:**
   ```
   Name: ens-auth-api (o el nombre que quieras)
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && node index.js
   ```

4. **Variables de Entorno:**
   Click en "Environment" y agrega:
   ```
   PORT=10000
   JWT_SECRET=tu-clave-secreta-aqui
   ETHEREUM_RPC_URL=https://eth.llamarpc.com
   ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
   NODE_ENV=production
   ```
   **Nota:** Render usa el puerto automáticamente, pero puedes usar cualquier número.

5. **Desplegar:**
   - Click "Create Web Service"
   - Espera a que termine el deploy (2-3 minutos)
   - Obtendrás una URL como: `https://ens-auth-api.onrender.com`
   - Tu API estará en: `https://ens-auth-api.onrender.com/api`

---

## ✅ Opción 2: Fly.io (Gratis con Créditos)

**Ventajas:**
- ✅ Muy rápido
- ✅ CLI amigable
- ✅ Créditos gratis cada mes

### Pasos:

1. **Instalar Fly CLI:**
   ```powershell
   # En PowerShell (Windows)
   irm https://fly.io/install.ps1 | iex
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **En la carpeta del proyecto:**
   ```bash
   cd server
   fly launch
   ```

4. **Seguir las preguntas:**
   - ¿Usar PostgreSQL? → No
   - Crear app: Sí
   - Nombre: ens-auth-api (o el que quieras)
   - Región: elige la más cercana

5. **Configurar variables:**
   ```bash
   fly secrets set JWT_SECRET=tu-clave-secreta
   fly secrets set ETHEREUM_RPC_URL=https://eth.llamarpc.com
   fly secrets set ALLOWED_ORIGINS=https://tu-pagina.com
   ```

6. **Desplegar:**
   ```bash
   fly deploy
   ```

7. **Tu API estará en:** `https://ens-auth-api.fly.dev/api`

---

## ✅ Opción 3: Cyclic.sh (Gratis para siempre)

**Ventajas:**
- ✅ Muy simple
- ✅ Conecta con GitHub
- ✅ Sin configuración complicada

### Pasos:

1. **Crear cuenta en [cyclic.sh](https://cyclic.sh)**
   - Conecta con GitHub

2. **Nuevo proyecto:**
   - Click "New App"
   - Selecciona tu repositorio
   - Selecciona la rama "main" o "master"

3. **Configurar:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

4. **Variables de Entorno:**
   Click en "Environment Variables" y agrega todas las variables.

5. **Deploy automático:**
   - Cada push a GitHub despliega automáticamente
   - Obtendrás: `https://tu-app.cyclic.app/api`

---

## ✅ Opción 4: Replit (Gratis, con IDE en línea)

**Ventajas:**
- ✅ Editor de código en el navegador
- ✅ Muy fácil para principiantes
- ✅ Despliegue automático

### Pasos:

1. **Crear cuenta en [replit.com](https://replit.com)**

2. **Nuevo Repl:**
   - Click "Create Repl"
   - Tipo: "Node.js"
   - Nombre: "ens-auth-api"

3. **Subir código:**
   - Arrastra la carpeta `server/` completa
   - O pega los archivos manualmente

4. **Configurar variables:**
   - En el panel izquierdo, click en "Secrets" (candado)
   - Agrega las variables de entorno

5. **Ejecutar:**
   - Click "Run"
   - Replit te da una URL automáticamente
   - Tu API: `https://tu-repl.repl.co/api`

---

## ✅ Opción 5: Vercel (Gratis, para APIs)

**Ventajas:**
- ✅ Muy rápido
- ✅ Excelente para APIs
- ✅ Integración con GitHub

### Pasos:

1. **Instalar Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **En la carpeta server:**
   ```bash
   cd server
   vercel
   ```

3. **Seguir las preguntas:**
   - ¿Link a proyecto existente? → No
   - Nombre del proyecto: ens-auth-api
   - Directorio: ./
   - Configuración: Enter para usar defaults

4. **Configurar variables:**
   ```bash
   vercel env add JWT_SECRET
   vercel env add ETHEREUM_RPC_URL
   vercel env add ALLOWED_ORIGINS
   ```

5. **Desplegar:**
   ```bash
   vercel --prod
   ```

6. **Tu API:** `https://ens-auth-api.vercel.app/api`

---

## ✅ Opción 6: Netlify Functions (Gratis)

**Ventajas:**
- ✅ Muy popular
- ✅ Funciones serverless
- ✅ Fácil integración

### Configuración necesaria:

Necesitas crear un archivo `netlify.toml` en la raíz:

```toml
[build]
  functions = "server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

Y adaptar el código para funciones serverless. Es un poco más complejo pero funciona muy bien.

---

## 🎯 Comparación Rápida

| Servicio | Dificultad | Gratis | Velocidad | Recomendado |
|----------|------------|--------|-----------|-------------|
| **Render.com** | ⭐ Fácil | ✅ Sí | ⚡ Rápido | ⭐⭐⭐⭐⭐ |
| **Cyclic.sh** | ⭐ Fácil | ✅ Sí | ⚡ Rápido | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ⭐⭐ Media | ✅ Con límites | ⚡⚡ Muy rápido | ⭐⭐⭐⭐ |
| **Replit** | ⭐ Fácil | ✅ Sí | ⚡ Medio | ⭐⭐⭐ |
| **Vercel** | ⭐⭐ Media | ✅ Sí | ⚡⚡ Muy rápido | ⭐⭐⭐⭐ |

---

## 💡 Recomendación

**Para empezar rápido:** Usa **Render.com** o **Cyclic.sh**

Son las más fáciles y no tienen limitaciones para Node.js en el plan gratuito.

---

## 🔧 Configuración Común

Todos estos servicios necesitan estas variables de entorno:

```env
PORT=10000 (o el que el servicio use automáticamente)
JWT_SECRET=tu-clave-secreta-muy-fuerte
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ALLOWED_ORIGINS=https://tu-pagina.com,https://pagina-amigo.com
NODE_ENV=production
```

---

## ❓ ¿Necesitas Ayuda con Alguna Opción?

Si tienes problemas con alguna de estas opciones, avísame y te ayudo paso a paso con la que elijas.

