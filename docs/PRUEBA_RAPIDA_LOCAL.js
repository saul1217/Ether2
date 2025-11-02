// ============================================
// SCRIPT DE PRUEBA RÁPIDA PARA LOCAL
// ============================================
// Ejecuta esto en la consola del navegador (F12) en http://localhost:3000

(async function testLocal() {
  console.log('🧪 Iniciando pruebas del backend local...\n');

  // Test 1: Health Check
  console.log('1️⃣ Probando health check...');
  try {
    const health = await fetch('http://localhost:3001/api/health');
    const healthData = await health.json();
    console.log('✅ Health check OK:', healthData);
  } catch (error) {
    console.error('❌ Health check FALLO:', error);
    console.error('   → Verifica que el servidor esté corriendo en puerto 3001');
    return;
  }

  // Test 2: Obtener Nonce
  console.log('\n2️⃣ Probando obtener nonce...');
  try {
    const nonceRes = await fetch('http://localhost:3001/api/auth/nonce', {
      method: 'GET'
    });
    const nonceData = await nonceRes.json();
    console.log('✅ Nonce recibido:', {
      nonce: nonceData.nonce.substring(0, 20) + '...',
      timestamp: nonceData.timestamp,
      nonceType: typeof nonceData.nonce,
      nonceLength: nonceData.nonce.length,
      esHexadecimal: /^[0-9a-f]+$/i.test(nonceData.nonce)
    });
  } catch (error) {
    console.error('❌ Obtener nonce FALLO:', error);
    return;
  }

  // Test 3: Verificar Proxy de Vite
  console.log('\n3️⃣ Probando proxy de Vite (/api/auth/nonce)...');
  try {
    const proxyRes = await fetch('/api/auth/nonce', {
      method: 'GET'
    });
    const proxyData = await proxyRes.json();
    console.log('✅ Proxy OK:', {
      nonce: proxyData.nonce.substring(0, 20) + '...',
      timestamp: proxyData.timestamp
    });
  } catch (error) {
    console.error('❌ Proxy FALLO:', error);
    console.error('   → Verifica vite.config.js tiene el proxy configurado');
  }

  // Test 4: Verificar Formato de Mensaje
  console.log('\n4️⃣ Verificando formato de mensaje...');
  const ensName = 'saul12.eth';
  const nonce = 'd32e76ff6e0ded08a4fab47457e7f75417fcc206b1d0a6454189638a4b462a61';
  const timestamp = String(Date.now());
  
  const message = `Autenticación ENS\n\nNombre: ${ensName}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
  
  console.log('✅ Mensaje de ejemplo:', {
    mensaje: JSON.stringify(message),
    longitud: message.length,
    empiezaCorrecto: message.startsWith('Autenticación ENS'),
    tieneDosSaltos: message.includes('\n\n'),
    incluyeENS: message.includes(`Nombre: ${ensName}`),
    incluyeNonce: message.includes(`Nonce: ${nonce}`),
    incluyeTimestamp: message.includes(`Timestamp: ${timestamp}`)
  });

  console.log('\n✅ Todas las pruebas completadas. Si algún test falló, verifica esa parte.');
  console.log('\n📝 Siguiente paso: Prueba hacer login y compara los logs del frontend con los del backend.');
})();

