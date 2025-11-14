#!/usr/bin/env node

/**
 * Script para generar iconos PWA desde un SVG
 *
 * Uso:
 * 1. Instalar sharp: npm install -D sharp
 * 2. Ejecutar: node scripts/generate-icons.js
 */

const fs = require('node:fs');
const path = require('node:path');

// Verificar si sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('❌ Error: El paquete "sharp" no está instalado.');
  console.error('   Instálalo con: npm install -D sharp');
  console.error('   O usa una de las otras opciones en public/icons/README.md');
  process.exit(1);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Verificar que el archivo fuente existe
if (!fs.existsSync(sourceIcon)) {
  console.error(`❌ Error: No se encontró el archivo ${sourceIcon}`);
  process.exit(1);
}

console.log('🎨 Generando iconos PWA...\n');

let completed = 0;
let errors = 0;

sizes.forEach(size => {
  const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

  sharp(sourceIcon)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
    })
    .png()
    .toFile(outputFile)
    .then(() => {
      completed++;
      console.log(`✅ Generado: icon-${size}x${size}.png`);

      if (completed + errors === sizes.length) {
        console.log(`\n🎉 Proceso completado: ${completed} iconos generados, ${errors} errores`);
      }
    })
    .catch(err => {
      errors++;
      console.error(`❌ Error generando icon-${size}x${size}.png:`, err.message);

      if (completed + errors === sizes.length) {
        console.log(`\n⚠️  Proceso completado con errores: ${completed} iconos generados, ${errors} errores`);
        process.exit(1);
      }
    });
});
