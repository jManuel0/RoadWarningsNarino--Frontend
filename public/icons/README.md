# PWA Icons

Este directorio contiene los iconos necesarios para la Progressive Web App (PWA).

## Iconos Requeridos

El archivo `manifest.json` requiere los siguientes tamaños de iconos:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Cómo Generar los Iconos

### Opción 1: Usar una herramienta online (Recomendado)

1. Ve a [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. Sube el archivo `icon.svg` o tu logo personalizado
3. Configura las opciones según tus preferencias
4. Descarga y extrae los archivos generados
5. Copia los archivos PNG a este directorio

### Opción 2: Usar ImageMagick (línea de comandos)

Si tienes ImageMagick instalado, ejecuta estos comandos desde este directorio:

```bash
# Convertir SVG a PNG en diferentes tamaños
magick icon.svg -resize 72x72 icon-72x72.png
magick icon.svg -resize 96x96 icon-96x96.png
magick icon.svg -resize 128x128 icon-128x128.png
magick icon.svg -resize 144x144 icon-144x144.png
magick icon.svg -resize 152x152 icon-152x152.png
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 384x384 icon-384x384.png
magick icon.svg -resize 512x512 icon-512x512.png
```

### Opción 3: Usar Node.js con sharp

Crea un script `generate-icons.js` en la raíz del proyecto:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('public/icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`Generated icon-${size}x${size}.png`))
    .catch(err => console.error(err));
});
```

Instala sharp y ejecuta:
```bash
npm install sharp
node generate-icons.js
```

## Icono Actual

El archivo `icon.svg` es un placeholder con:
- Fondo azul (#2563eb)
- Triángulo de advertencia amarillo
- Signo de exclamación
- Representación de una carretera en la parte inferior

**Recomendación**: Reemplaza `icon.svg` con tu logo personalizado antes de generar los PNG.

## Verificar

Una vez generados los iconos, verifica que todos los archivos estén presentes:
```bash
ls -la public/icons/
```

Deberías ver:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
