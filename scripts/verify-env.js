#!/usr/bin/env node

/**
 * Script de verificación de variables de entorno
 * Verifica que todas las variables necesarias estén configuradas
 */

const https = require('https');
const http = require('http');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  
  if (!value) {
    if (required) {
      log(`❌ ${name}: NO CONFIGURADA (REQUERIDA)`, 'red');
      return false;
    } else {
      log(`⚠️  ${name}: No configurada (opcional)`, 'yellow');
      return true;
    }
  }
  
  log(`✅ ${name}: ${value}`, 'green');
  return true;
}

function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    log(`\n🔍 Probando conexión a: ${url}`, 'cyan');
    
    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        log(`✅ Conexión exitosa (${res.statusCode})`, 'green');
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (Array.isArray(json)) {
              log(`✅ Respuesta válida: ${json.length} alertas encontradas`, 'green');
            } else {
              log(`⚠️  Respuesta no es un array`, 'yellow');
            }
          } catch (e) {
            log(`⚠️  Respuesta no es JSON válido`, 'yellow');
          }
          resolve(true);
        });
      } else {
        log(`❌ Error: HTTP ${res.statusCode}`, 'red');
        resolve(false);
      }
    }).on('error', (err) => {
      log(`❌ Error de conexión: ${err.message}`, 'red');
      resolve(false);
    });
  });
}

async function main() {
  log('\n==============================================', 'blue');
  log('🔍 VERIFICACIÓN DE CONFIGURACIÓN', 'blue');
  log('==============================================\n', 'blue');
  
  // Cargar variables de entorno desde .env si existe
  try {
    require('dotenv').config();
  } catch (e) {
    log('⚠️  dotenv no instalado, usando variables del sistema', 'yellow');
  }
  
  log('📋 Variables de Entorno:\n', 'cyan');
  
  const checks = [
    checkEnvVar('VITE_API_URL', true),
    checkEnvVar('VITE_WS_URL', false),
    checkEnvVar('VITE_GOOGLE_MAPS_API_KEY', false),
  ];
  
  const allPassed = checks.every(check => check);
  
  log('\n==============================================\n', 'blue');
  
  if (!allPassed) {
    log('❌ Algunas variables requeridas no están configuradas', 'red');
    log('\n💡 Solución:', 'yellow');
    log('   1. Crea un archivo .env en la raíz del proyecto', 'yellow');
    log('   2. Agrega: VITE_API_URL=https://tu-backend.railway.app/api', 'yellow');
    log('   3. Para producción, configura las variables en Vercel', 'yellow');
    process.exit(1);
  }
  
  // Probar conexión al backend
  const apiUrl = process.env.VITE_API_URL;
  if (apiUrl) {
    const alertsUrl = `${apiUrl}/alert`;
    const success = await testUrl(alertsUrl);
    
    if (!success) {
      log('\n❌ No se pudo conectar al backend', 'red');
      log('\n💡 Verifica que:', 'yellow');
      log('   1. El backend esté corriendo', 'yellow');
      log('   2. La URL sea correcta', 'yellow');
      log('   3. No haya problemas de CORS', 'yellow');
      process.exit(1);
    }
  }
  
  log('\n==============================================', 'green');
  log('✅ TODAS LAS VERIFICACIONES PASARON', 'green');
  log('==============================================\n', 'green');
  
  log('📝 Próximos pasos:', 'cyan');
  log('   1. Ejecuta: npm run dev (para desarrollo)', 'cyan');
  log('   2. Ejecuta: npm run build (para producción)', 'cyan');
  log('   3. Configura las mismas variables en Vercel', 'cyan');
  log('   4. Haz deploy: vercel --prod\n', 'cyan');
}

main().catch((err) => {
  log(`\n❌ Error inesperado: ${err.message}`, 'red');
  process.exit(1);
});
