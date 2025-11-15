# 🗺️ Sistema de Mapas Geoespaciales - RoadWarnings Nariño

Sistema completo de mapas interactivos para visualización de alertas viales, navegación GPS y cálculo de rutas para el departamento de Nariño, Colombia.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Arquitectura](#arquitectura)
- [API Reference](#api-reference)
- [Integración con Backend](#integración-con-backend)
- [Personalización](#personalización)
- [Troubleshooting](#troubleshooting)

## ✨ Características

### Funcionalidades Principales

- ✅ **Mapa Interactivo**: Centrado en Pasto, Nariño con OpenStreetMap
- ✅ **Geolocalización en Tiempo Real**: Seguimiento GPS con Web APIs
- ✅ **Visualización de Alertas**: Iconos personalizados según tipo y severidad
- ✅ **Clustering Inteligente**: Agrupación automática cuando hay muchas alertas
- ✅ **Cálculo de Rutas**: Integración con OSRM para rutas óptimas
- ✅ **Navegación Paso a Paso**: Instrucciones detalladas en español
- ✅ **Actualización Automática**: Alertas actualizadas cada 10 segundos
- ✅ **Modo Oscuro**: Soporte completo para tema oscuro
- ✅ **Responsive**: Funciona en móviles, tablets y desktop
- ✅ **Sin API Keys**: 100% gratuito, sin restricciones

### Características Avanzadas

- 🎯 Cálculo de distancia en tiempo real
- 📍 Marcadores personalizados para cada tipo de alerta
- 🧭 Navegación "Ir a esta alerta" desde ubicación actual
- 📊 Panel de información de ruta con distancia y tiempo
- 🔄 Actualización periódica de datos
- ⚡ Optimizado para rendimiento
- ♿ Accesible y con manejo robusto de errores

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18+ | Framework UI |
| **TypeScript** | 5+ | Type safety |
| **Leaflet** | 1.9+ | Mapas raster |
| **React-Leaflet** | 4+ | Integración React + Leaflet |
| **OpenStreetMap** | - | Tiles del mapa (gratuito) |
| **OSRM** | API v1 | Cálculo de rutas (gratuito) |
| **Geolocation API** | - | Ubicación del navegador |
| **Leaflet.markercluster** | 1.5+ | Clustering de marcadores |

## 📦 Instalación

### 1. Instalar Dependencias

```bash
npm install leaflet react-leaflet leaflet.markercluster
npm install --save-dev @types/leaflet @types/leaflet.markercluster
```

### 2. Estructura de Archivos

Asegúrate de tener esta estructura:

```
src/
├── components/
│   └── map/
│       ├── RoadAlertsMap.tsx       # Componente principal
│       └── RoadAlertsMap.css       # Estilos
├── hooks/
│   └── useGeolocation.ts           # Hook de geolocalización
├── services/
│   └── osrmService.ts              # Servicio de rutas
├── utils/
│   ├── mapHelpers.ts               # Utilidades geoespaciales
│   └── mapIcons.ts                 # Generador de iconos
└── types/
    └── map.types.ts                # Tipos TypeScript
```

### 3. Importar CSS de Leaflet

En tu archivo principal (`main.tsx` o `App.tsx`):

```typescript
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
```

## 🚀 Uso Básico

### Ejemplo Simple

```tsx
import { RoadAlertsMap } from '@/components/map/RoadAlertsMap';

function App() {
  return (
    <div className="h-screen w-full">
      <RoadAlertsMap />
    </div>
  );
}
```

### Ejemplo con Props

```tsx
import { RoadAlertsMap } from '@/components/map/RoadAlertsMap';

function MapPage() {
  const handleAlertClick = (alert) => {
    console.log('Alerta seleccionada:', alert);
  };

  const handleRouteCalculated = (route) => {
    console.log('Ruta calculada:', route);
  };

  return (
    <RoadAlertsMap
      height="600px"
      showControls={true}
      enableClustering={true}
      updateInterval={10000}
      onAlertClick={handleAlertClick}
      onRouteCalculated={handleRouteCalculated}
      darkMode={false}
    />
  );
}
```

### Integración en tu Página Home

```tsx
// src/pages/Home.tsx
import { RoadAlertsMap } from '@/components/map/RoadAlertsMap';

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Alertas Viales - Nariño
      </h1>

      <div className="rounded-lg overflow-hidden shadow-xl">
        <RoadAlertsMap
          height="70vh"
          showControls={true}
          enableClustering={true}
        />
      </div>
    </div>
  );
}
```

## 🏗️ Arquitectura

### Componentes

```
RoadAlertsMap (Principal)
├── MapContainer (react-leaflet)
│   ├── TileLayer (OpenStreetMap)
│   ├── Marker (Usuario)
│   ├── Marker[] (Alertas)
│   └── Polyline (Ruta)
├── RouteInfoPanel (Panel de ruta)
├── MapControls (Controles)
└── AlertPopupContent (Popups)
```

### Flujo de Datos

```
1. Componente monta
   ↓
2. useGeolocation inicia seguimiento GPS
   ↓
3. loadAlerts() carga alertas desde backend
   ↓
4. Alertas se muestran en el mapa con iconos personalizados
   ↓
5. Usuario hace clic en alerta
   ↓
6. handleNavigateToAlert() calcula ruta con OSRM
   ↓
7. Ruta se dibuja en el mapa
```

### Hooks Utilizados

| Hook | Propósito |
|------|-----------|
| `useGeolocation` | Obtiene y rastrea ubicación del usuario |
| `useState` | Maneja estado del mapa (alertas, rutas, etc.) |
| `useEffect` | Carga inicial y actualización periódica |
| `useCallback` | Optimiza funciones de callback |
| `useRef` | Referencias al mapa y timers |

## 📖 API Reference

### Props de RoadAlertsMap

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `height` | `string` | `'100vh'` | Altura CSS del mapa |
| `showControls` | `boolean` | `true` | Mostrar controles de navegación |
| `enableClustering` | `boolean` | `true` | Habilitar clustering de alertas |
| `updateInterval` | `number` | `10000` | Intervalo de actualización (ms) |
| `onAlertClick` | `(alert) => void` | - | Callback al hacer clic en alerta |
| `onRouteCalculated` | `(route) => void` | - | Callback cuando se calcula ruta |
| `darkMode` | `boolean` | `false` | Activar modo oscuro |

### Funciones del Hook useGeolocation

```typescript
const {
  position,          // Coordenadas actuales
  accuracy,          // Precisión en metros
  heading,           // Dirección en grados
  speed,             // Velocidad en m/s
  error,             // Error de geolocalización
  isTracking,        // Estado de seguimiento
  lastUpdate,        // Última actualización
  getCurrentPosition,// Obtener ubicación una vez
  startTracking,     // Iniciar seguimiento continuo
  stopTracking,      // Detener seguimiento
  resetTracking,     // Reiniciar
  isSupported,       // ¿Navegador compatible?
} = useGeolocation(options);
```

### Funciones de OSRM Service

```typescript
// Calcular ruta simple
const route = await calculateRoute(origin, destination);

// Calcular rutas alternativas
const routes = await calculateAlternativeRoutes(origin, destination, 2);

// Ruta con múltiples waypoints
const route = await calculateMultiWaypointRoute([point1, point2, point3]);

// Formatear distancia
const formatted = formatDistance(1500); // "1.5 km"

// Formatear duración
const formatted = formatDuration(3720); // "1 h 2 min"
```

### Funciones de Map Helpers

```typescript
// Calcular distancia entre dos puntos
const distance = calculateDistance(point1, point2); // En metros

// Calcular rumbo
const bearing = calculateBearing(from, to); // 0-360 grados

// Verificar si está dentro de un radio
const isNear = isWithinRadius(point, center, 1000); // 1km

// Filtrar alertas cercanas
const nearby = filterAlertsInRadius(alerts, center, 5000);

// Ordenar por distancia
const sorted = sortAlertsByDistance(alerts, userPosition);
```

## 🔌 Integración con Backend

### Configuración de API

El mapa se conecta automáticamente con tu backend. Asegúrate de que estos endpoints estén disponibles:

```typescript
// src/api/alertApi.ts

export const alertApi = {
  // GET /api/alert - Obtener todas las alertas
  getAlerts: async (): Promise<RoadAlert[]> => {
    const response = await fetch(`${API_URL}/alert`);
    return response.json();
  },

  // POST /api/alert - Crear nueva alerta
  createAlert: async (alert: CreateAlertDTO) => {
    const response = await fetch(`${API_URL}/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    return response.json();
  },
};
```

### Formato de Datos Esperado

```typescript
interface RoadAlert {
  id: number;
  type: 'ACCIDENTE' | 'DERRUMBE' | 'INUNDACION' | ...;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  municipality?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  username: string;
  userId: number;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}
```

### Backend Setup (Ya configurado)

Tu backend en `localhost:8080/api` ya está configurado con:

✅ Endpoints públicos para alertas (`/alert/**`)
✅ Base de datos H2 con datos de ejemplo
✅ CORS habilitado para el frontend
✅ 8 alertas de ejemplo en Nariño

## 🎨 Personalización

### Cambiar Centro del Mapa

```typescript
// src/utils/mapHelpers.ts
export const CUSTOM_CENTER: Coordinates = {
  lat: 1.2136,  // Tu latitud
  lng: -77.2811 // Tu longitud
};
```

### Personalizar Iconos

```typescript
// src/utils/mapIcons.ts
const ALERT_COLORS: Record<AlertType, string> = {
  ACCIDENTE: '#ef4444',     // Cambiar color
  DERRUMBE: '#f97316',
  // ... más tipos
};
```

### Cambiar Proveedor de Tiles

```tsx
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; CARTO'
/>
```

Opciones disponibles:
- OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- CARTO Light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- CARTO Dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

### Modificar Intervalo de Actualización

```tsx
<RoadAlertsMap updateInterval={5000} /> // 5 segundos
```

## 🐛 Troubleshooting

### Problema: "Geolocalización no soportada"

**Solución**: Asegúrate de:
1. Usar HTTPS (o localhost para desarrollo)
2. Dar permisos de ubicación en el navegador
3. Verificar que el dispositivo tenga GPS/WiFi activo

### Problema: "No se puede calcular ruta"

**Solución**:
1. Verificar conexión a internet
2. Revisar que las coordenadas estén en Colombia
3. Comprobar que OSRM esté respondiendo:
   ```
   https://router.project-osrm.org/route/v1/driving/-77.2811,1.2136;-77.6425,0.8247
   ```

### Problema: Iconos no se muestran

**Solución**: Importar CSS de Leaflet:
```typescript
import 'leaflet/dist/leaflet.css';
```

### Problema: Mapa no responde

**Solución**: Verificar altura del contenedor:
```css
.map-container {
  height: 600px; /* Altura explícita */
}
```

### Problema: "Failed to fetch alerts"

**Solución**: Verificar que el backend esté corriendo:
```bash
# Terminal 1 - Backend
cd ../RoadWarningsnarino-backend
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 - Frontend
cd roadwarnings-frontend
npm run dev
```

## 📊 Rendimiento

### Optimizaciones Implementadas

- ✅ Clustering automático para > 50 alertas
- ✅ Debouncing de eventos del mapa
- ✅ Memoización de cálculos pesados
- ✅ Lazy loading de datos
- ✅ Hardware acceleration para tiles
- ✅ Optimización de re-renders con useCallback

### Métricas Esperadas

| Métrica | Valor |
|---------|-------|
| Tiempo de carga inicial | < 2s |
| FPS durante zoom/pan | 60 fps |
| Memoria usada | ~50-80 MB |
| Alertas soportadas sin lag | 1000+ |

## 📝 Licencias

- **OpenStreetMap**: © OpenStreetMap contributors (ODbL)
- **OSRM**: MIT License
- **Leaflet**: BSD 2-Clause License
- **React-Leaflet**: MIT License

## 🤝 Contribuir

Para mejorar el sistema de mapas:

1. Crea una nueva rama: `git checkout -b feature/mejora-mapa`
2. Realiza tus cambios
3. Prueba exhaustivamente
4. Commit: `git commit -m "feat: descripción"`
5. Push: `git push origin feature/mejora-mapa`

## 📚 Recursos Adicionales

- [Documentación de Leaflet](https://leafletjs.com/reference.html)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [OSRM API Docs](http://project-osrm.org/docs/v5.24.0/api/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## ✅ Checklist de Implementación

- [x] Tipos e interfaces TypeScript
- [x] Iconos personalizados por tipo de alerta
- [x] Servicio de rutas OSRM
- [x] Hook de geolocalización
- [x] Utilidades geoespaciales
- [x] Componente principal RoadAlertsMap
- [x] Estilos CSS
- [x] Integración con backend
- [x] Documentación completa
- [x] Manejo de errores robusto
- [x] Modo oscuro
- [x] Responsive design
- [x] Actualización automática
- [x] Clustering de marcadores

---

**Sistema desarrollado para RoadWarnings Nariño** 🗺️🚗⚠️
