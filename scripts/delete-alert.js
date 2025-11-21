#!/usr/bin/env node

/**
 * Script para eliminar una alerta específica
 * Uso: node scripts/delete-alert.js <ALERT_ID> <TOKEN>
 */

const https = require('https');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deleteAlert(alertId, token) {
  const apiUrl = process.env.VITE_API_URL || 'https://roadwarningsnarino-backend-production.up.railway.app/api';
  const url = `${apiUrl}/alert/${alertId}`;

  log(`\n🗑️  Intentando eliminar alerta ID: ${alertId}`, 'cyan');
  log(`URL: ${url}\n`, 'cyan');

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'DELETE',
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
      log('✅ Token de autenticación incluido', 'green');
    } else {
      log('⚠️  Sin token de autenticación', 'yellow');
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          log('\n✅ Alerta eliminada exitosamente!', 'green');
          resolve(true);
        } else if (res.statusCode === 401) {
          log('\n❌ Error: No autorizado', 'red');
          log('💡 Necesitas un token válido de autenticación', 'yellow');
          log('   Obtén tu token desde localStorage en el navegador:', 'yellow');
          log('   1. Abre DevTools (F12)', 'yellow');
          log('   2. Ve a Console', 'yellow');
          log('   3. Ejecuta: localStorage.getItem("auth-storage")', 'yellow');
          log('   4. Busca el campo "token" en el JSON', 'yellow');
          reject(new Error('No autorizado'));
        } else if (res.statusCode === 403) {
          log('\n❌ Error: Prohibido', 'red');
          log('💡 No tienes permisos para eliminar esta alerta', 'yellow');
          log('   Solo el creador o un admin pueden eliminarla', 'yellow');
          reject(new Error('Prohibido'));
        } else if (res.statusCode === 404) {
          log('\n❌ Error: Alerta no encontrada', 'red');
          log(`   La alerta con ID ${alertId} no existe`, 'yellow');
          reject(new Error('No encontrada'));
        } else {
          log(`\n❌ Error: HTTP ${res.statusCode}`, 'red');
          log(`Respuesta: ${data}`, 'red');
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      log(`\n❌ Error de conexión: ${err.message}`, 'red');
      reject(err);
    });

    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('\n❌ Error: Debes proporcionar el ID de la alerta', 'red');
    log('\nUso:', 'cyan');
    log('  node scripts/delete-alert.js <ALERT_ID>', 'cyan');
    log('  node scripts/delete-alert.js <ALERT_ID> <TOKEN>', 'cyan');
    log('\nEjemplo:', 'cyan');
    log('  node scripts/delete-alert.js 1', 'cyan');
    log('  node scripts/delete-alert.js 1 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 'cyan');
    process.exit(1);
  }

  const alertId = parseInt(args[0]);
  const token = args[1];

  if (isNaN(alertId)) {
    log('\n❌ Error: El ID debe ser un número', 'red');
    process.exit(1);
  }

  try {
    await deleteAlert(alertId, token);
    log('\n✨ Operación completada', 'green');
  } catch (error) {
    log(`\n💡 Alternativa: Elimina la alerta desde Railway:`, 'yellow');
    log('   1. Ve a Railway → Postgres → Database → Data', 'yellow');
    log('   2. Busca la tabla "alerts"', 'yellow');
    log(`   3. Elimina la fila con id = ${alertId}`, 'yellow');
    process.exit(1);
  }
}

main();
