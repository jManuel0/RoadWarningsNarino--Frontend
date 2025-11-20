# Road Warnings Frontend

Sistema de alertas viales en tiempo real para Pasto, Nariño, Colombia. Una aplicación web progresiva (PWA) construida con React, TypeScript y Leaflet.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contribuir](#contribuir)

## ✨ Características

### Funcionalidades Principales

- 🗺️ **Mapas Interactivos**: Visualización de alertas en mapas con Leaflet
- ⚡ **Tiempo Real**: WebSocket para actualizaciones en vivo
- 📱 **PWA**: Instalable, funciona offline, notificaciones push
- 🌓 **Modo Oscuro**: Tema claro/oscuro con persistencia
- 🔐 **Autenticación**: Sistema completo con refresh tokens
- 📊 **Estadísticas**: Dashboard con gráficos y analytics
- 🚗 **Navegación GPS**: Rutas optimizadas evitando alertas críticas
- 💬 **Sistema Social**: Comentarios, votos, favoritos
- 🔔 **Notificaciones**: Alertas en tiempo real con sonido
- 📤 **Exportación**: CSV, JSON, PDF de datos

### Características Técnicas

- ✅ Code Splitting y Lazy Loading
- ✅ Skeleton Loaders para mejor UX
- ✅ Error Boundary con retry logic
- ✅ Validación y sanitización de inputs (XSS prevention)
- ✅ Retry logic para peticiones HTTP
- ✅ Tests unitarios y de integración
- ✅ TypeScript strict mode
- ✅ Responsive design (Mobile-first)
- ✅ Optimización de performance

## 🛠️ Tecnologías

### Core

- **React 18.2** - Framework UI
- **TypeScript 5.2** - Type safety
- **Vite 5.4** - Build tool & dev server
- **React Router 6.20** - Routing

### Mapas

- **Leaflet 1.9** - Mapas interactivos
- **React-Leaflet 4.2** - Componentes React para Leaflet
- **Leaflet.MarkerCluster** - Clustering de marcadores
- **Leaflet.Heat** - Heatmaps
- **OSRM** - Routing engine

### Estado y Data

- **Zustand 4.4** - State management
- **Axios 1.6** - HTTP client
- **WebSocket** - Real-time communication

### UI/UX

- **Tailwind CSS 3.3** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Recharts** - Charts

### Testing

- **Jest 30** - Test runner
- **Testing Library** - Component testing
- **ts-jest** - TypeScript support for Jest

### Development

- **ESLint 9** - Linting
- **PostCSS** - CSS processing
- **Sharp** - Image optimization

## 📦 Requisitos Previos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Para clonar el repositorio

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd roadwarnings-frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_GOOGLE_MAPS_API_KEY=tu-api-key-opcional
VITE_USE_MOCK=false
```

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## ⚙️ Configuración

### Variables de Entorno

| Variable                   | Descripción          | Requerido      | Default |
| -------------------------- | -------------------- | -------------- | ------- |
| `VITE_API_URL`             | URL del backend API  | ✅ Sí          | -       |
| `VITE_WS_URL`              | URL del WebSocket    | ⚠️ Recomendado | -       |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key  | ❌ No          | -       |
| `VITE_USE_MOCK`            | Usar datos de prueba | ❌ No          | `false` |

### Configuración de TypeScript

El proyecto usa TypeScript en modo estricto:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

### Configuración de Tailwind

Tema personalizado con soporte para modo oscuro:

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // ...
};
```

## 📜 Scripts Disponibles

### Desarrollo

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build de producción
```

### Testing

```bash
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Generar reporte de cobertura
```

### Linting y Format

```bash
npm run lint         # Ejecutar ESLint
```

### Otros

```bash
npm run generate:icons # Generar iconos PWA
```

## 📁 Estructura del Proyecto

```
roadwarnings-frontend/
├── public/              # Assets estáticos
│   ├── icons/          # Iconos PWA
│   ├── manifest.json   # PWA manifest
│   └── sw.js           # Service Worker
├── src/
│   ├── api/            # Servicios API (14 archivos)
│   │   ├── authApi.ts
│   │   ├── alertApi.ts
│   │   ├── userApi.ts
│   │   └── ...
│   ├── components/     # Componentes React (36+)
│   │   ├── AlertCard.tsx
│   │   ├── CreateAlertForm.tsx
│   │   ├── Navigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── ...
│   ├── pages/          # Páginas de rutas (12)
│   │   ├── Home.tsx
│   │   ├── Alerts.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── stores/         # Zustand stores (5)
│   │   ├── authStore.ts
│   │   ├── alertStore.ts
│   │   ├── filterStore.ts
│   │   ├── settingsStore.ts
│   │   └── navigationStore.ts
│   ├── hooks/          # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   ├── useWebSocket.ts
│   │   ├── useFormValidation.ts
│   │   └── ...
│   ├── services/       # Servicios externos
│   │   ├── websocket.ts
│   │   ├── routing.ts
│   │   └── ...
│   ├── types/          # TypeScript type definitions
│   │   ├── Alert.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── utils/          # Utilidades
│   │   ├── validation.ts
│   │   ├── retryHelper.ts
│   │   ├── authInterceptor.ts
│   │   ├── notifications.ts
│   │   └── ...
│   ├── config/         # Configuración
│   │   └── env.ts
│   ├── test/           # Setup de testing
│   │   ├── setup.ts
│   │   ├── test-utils.tsx
│   │   └── __mocks__/
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Entry point
│   └── index.css       # Estilos globales
├── .env.example        # Ejemplo de variables de entorno
├── .gitignore
├── index.html
├── jest.config.cjs     # Configuración de Jest
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Cobertura de Tests

Objetivo de cobertura: **60%** mínimo

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

### Escribir Tests

Usar las utilidades de testing proporcionadas:

```tsx
import { render, screen, fireEvent } from "@/test/test-utils";
import { createMockAlert } from "@/test/test-utils";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## 🚀 Deployment

### Build para Producción

```bash
npm run build
```

Esto genera el directorio `dist/` con los archivos optimizados.

### Deployment en Vercel

El proyecto incluye `vercel.json` configurado:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Variables de Entorno en Producción

Asegúrate de configurar en tu plataforma de deployment:

- `VITE_API_URL` → URL de tu backend en producción
- `VITE_WS_URL` → URL de WebSocket en producción
- `VITE_GOOGLE_MAPS_API_KEY` (opcional)

### PWA

La aplicación es una PWA con:

- Service Worker para cache offline
- Manifest para instalación
- Iconos en múltiples tamaños
- Soporte para notificaciones push

## 🤝 Contribuir

### Flujo de Trabajo

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usar TypeScript con tipos estrictos
- Seguir las reglas de ESLint
- Escribir tests para nuevas funcionalidades
- Documentar funciones complejas
- Usar commits descriptivos (Conventional Commits)

### Testing Requerido

- Tests unitarios para lógica de negocio
- Tests de componentes para UI crítica
- Cobertura mínima del 60%

## 📝 Licencia

Este proyecto es privado y no tiene licencia pública.

## 👥 Autores

- **Tu Nombre** - _Desarrollo inicial_

## 🙏 Agradecimientos

- Comunidad de React
- Leaflet y OpenStreetMap
- Tailwind CSS
- Y todos los contribuidores de las librerías usadas

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles

---

**Desarrollado con ❤️ en Pasto, Nariño, Colombia**
