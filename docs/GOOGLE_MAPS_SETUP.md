# 🔑 Configuración de Google Maps API

## Paso 1: Crear Proyecto en Google Cloud

1. Ve a: https://console.cloud.google.com/
2. Crea una nueva cuenta o inicia sesión
3. Click en el menú (☰) → "Select a Project" → "New Project"
4. Nombre: "RoadWarnings Nariño"
5. Click "Create"

## Paso 2: Habilitar APIs Necesarias

1. En el dashboard, ve a "APIs & Services" → "Library"
2. Busca y habilita estas 3 APIs:
   - ✅ **Maps JavaScript API** (para el mapa)
   - ✅ **Directions API** (para rutas)
   - ✅ **Geolocation API** (para ubicación)

## Paso 3: Crear API Key

1. Ve a "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copia la API Key (ejemplo: `AIzaSyB...`)
4. Click en el nombre de la API Key para editarla

## Paso 4: Configurar Restricciones (IMPORTANTE)

### Para Desarrollo Local:
- Application restrictions: **HTTP referrers**
- Website restrictions:
  - `http://localhost:5173/*`
  - `http://localhost:*`

### Para Producción (Vercel):
- Agrega también:
  - `https://road-warnings-narino-frontend.vercel.app/*`
  - `https://*.vercel.app/*`

### API restrictions:
- Restrict key
- Selecciona solo:
  - Maps JavaScript API
  - Directions API
  - Geolocation API

## Paso 5: Agregar API Key a tu Proyecto

Crea/edita el archivo `.env`:

```bash
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

## 💰 Límites Gratuitos

Google Maps te da **$200 USD/mes GRATIS**, que es:
- 28,000 cargas de mapa al mes
- 40,000 direcciones al mes
- ¡Más que suficiente para desarrollo y uso moderado!

## 🔒 Seguridad

- ✅ Nunca compartas tu API key públicamente
- ✅ Siempre configura restricciones
- ✅ Monitorea uso en el dashboard

## ✅ Verificar que Funciona

Una vez configurado, visita:
```
http://localhost:5173
```

Deberías ver el mapa de Google Maps cargando.

## 🐛 Troubleshooting

- **"This API project is not authorized to use this API"**: Habilita la API en Google Cloud Console
- **"RefererNotAllowedMapError"**: Agrega tu dominio a las restricciones
- **Mapa gris**: Revisa que las 3 APIs estén habilitadas
