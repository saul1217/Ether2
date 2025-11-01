# 🔧 Guía de Solución de Problemas

## Error: "La firma no corresponde al propietario del nombre ENS"

Este error significa que la dirección Ethereum que firmó el mensaje no coincide con el propietario registrado del nombre ENS en la blockchain.

### Posibles Causas y Soluciones:

#### 1. **Estás usando un ENS que no te pertenece**

**Síntoma:** Ingresaste "usuario.eth" pero tu wallet es propietaria de "saul12.eth"

**Solución:**
- Ingresa el nombre ENS correcto que pertenece a tu wallet conectada
- O deja el campo vacío para que el sistema detecte automáticamente tu ENS

#### 2. **El ENS apunta a una dirección diferente**

**Síntoma:** Tu ENS existe pero el owner registrado es diferente a tu wallet actual

**Solución:**
- Verifica en [ENS App](https://app.ens.domains) que tu wallet es el owner del ENS
- Si el ENS fue transferido, asegúrate de estar usando la wallet correcta
- Algunos ENS pueden tener un "controller" diferente al "owner" - el sistema requiere ser owner

#### 3. **Problema de red**

**Síntoma:** El sistema no puede verificar el ENS en la blockchain

**Solución:**
- Verifica que estás en Ethereum Mainnet (no testnets)
- Intenta cambiar el RPC en `.env` usando un proveedor diferente
- Ejemplo: `ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`

#### 4. **Formato del mensaje**

**Síntoma:** El mensaje firmado no coincide con el esperado

**Solución:**
- Asegúrate de que el nonce y timestamp sean strings (ahora el código lo maneja automáticamente)
- Revisa la consola del navegador y del servidor para ver los logs de debug

## Verificación Manual

### Paso 1: Verifica tu ENS
```bash
# En la consola del navegador
const provider = new ethers.BrowserProvider(window.ethereum);
const address = await provider.getSigner().getAddress();
const ensName = await provider.lookupAddress(address);
console.log('Tu ENS:', ensName);
```

### Paso 2: Verifica el Owner
Visita [ENS App](https://app.ens.domains) y busca tu ENS para verificar:
- Quién es el owner actual
- Si tu wallet es el owner

### Paso 3: Revisa los Logs

**En el Frontend (Consola del Navegador):**
- Busca mensajes que empiecen con `[Login]`
- Verifica que el ENS name sea correcto
- Verifica que el nonce y timestamp sean strings

**En el Backend (Terminal del Servidor):**
- Busca mensajes que empiecen con `[ENS Validator]`
- Compara las direcciones:
  - Dirección recuperada de la firma
  - Owner del ENS
  - Dirección resuelta del ENS

## Casos Especiales

### ENS sin Resolver
Si tu ENS no tiene una dirección resuelta pero tienes el owner correcto, el sistema ahora aceptará la autenticación basándose solo en el ownership.

### ENS Transferido Recientemente
Si acabas de transferir un ENS, espera unos minutos para que la blockchain se sincronice.

### Testnets
El sistema está configurado para Ethereum Mainnet. Si quieres usar testnets, necesitarás modificar la dirección del ENS Registry en `ensValidator.js`.

## Debugging Avanzado

### Habilitar Logs Detallados

Los logs ya están habilitados. Revisa:
- **Frontend:** Abre las DevTools (F12) → Console
- **Backend:** Revisa la terminal donde corre el servidor

### Probar la Firma Manualmente

```javascript
// En la consola del navegador
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const message = "Autenticación ENS\n\nNombre: tu-ens.eth\nNonce: abc123\nTimestamp: 1234567890";
const signature = await signer.signMessage(message);
const recovered = ethers.verifyMessage(message, signature);
console.log('Dirección que firmó:', recovered);
console.log('Dirección de tu wallet:', await signer.getAddress());
```

Ambas direcciones deben coincidir.

## Contacto

Si después de revisar estos pasos el problema persiste, por favor incluye en tu reporte:
1. El nombre ENS que estás usando
2. La dirección de tu wallet
3. Los logs de la consola (frontend y backend)
4. Capturas de pantalla del error

