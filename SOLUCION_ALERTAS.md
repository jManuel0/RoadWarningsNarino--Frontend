# 🔧 Solución: Alertas no aparecen en el mapa

## 📋 Resumen del Problema

Tu backend en Railway funciona correctamente y devuelve 4 alertas cuando haces:

```bash
curl "https://roadwarningsnarino-backend-production.up.railway.app/api/alert"
```

Pero las alertas **NO aparecen en el mapa** de tu sitio web en Vercel.

## ✅ Causa Identificada

**La variable de entorno `VITE_API_URL` no está configurada en Vercel.**

Cuando Vite construye tu aplicación para producción, reemplaza `import.meta.env.VITE_API_URL` con el valor de la variable de entorno. Si no está configurada, usa el valor por defecto (`http://localhost:8080/api`), que obviamente no funciona en producción.

## 🚀 Solución (3 pasos)

### Paso 1: Configurar Variable en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://roadwarningsnarino-backend-production.up.railway.app/api`
   - **Environment**: Production ✅
5. Haz clic en **Save**

### Paso 2: Re-deploy

⚠️ **IMPORTANTE**: Las variables de entorno solo se aplican en nuevos builds.

1. Ve a **Deployments**
2. Encuentra el último deployment
3. Haz clic en los tres puntos (...) → **Redeploy**
4. Espera a que termine el build

### Paso 3: Verificar

Visita tu sitio y ve a: `https://tu-dominio.vercel.app/debug`

Esta página te mostrará:

- ✅ Si la variable está configurada
- ✅ Si el backend responde
- ✅ Cuántas alertas se reciben

## 🧪 Verificación Local (Opcional)

Antes de hacer deploy, puedes verificar que todo esté bien localmente:

```bash
# Verificar variables de entorno
npm run verify:env

# Si todo está bien, hacer build de prueba
npm run build

# Previsualizar el build
npm run preview
```

## 📱 Acceso a la Página de Debug

He creado una página especial para diagnosticar problemas:

**URL**: `/debug`

Esta página muestra:

- Variables de entorno configuradas
- URL de la API que se está usando
- Pruebas de conexión en tiempo real
- Datos de las alertas recibidas
- Información del navegador

## 🔍 Cómo Verificar en Producción

### Opción 1: Página de Debug

```
https://tu-dominio.vercel.app/debug
```

### Opción 2: Consola del Navegador

1. Abre tu sitio en producción
2. Presiona **F12**
3. Ve a **Console**
4. Busca mensajes como:
   - ✅ `✅ X alertas cargadas`
   - ❌ `Error al obtener alertas`

### Opción 3: Network Tab

1. Presiona **F12** → **Network**
2. Recarga la página
3. Busca la petición a `/alert`
4. Verifica:
   - **Request URL**: Debe apuntar a Railway
   - **Status**: Debe ser `200 OK`
   - **Response**: Debe mostrar las alertas

## 📚 Documentación Completa

Para más detalles, consulta:

- `VERCEL_CONFIG.md` - Guía completa de configuración de Vercel
- `DEPLOYMENT.md` - Guía general de deployment

## ❓ Preguntas Frecuentes

### ¿Por qué funciona en local pero no en producción?

En local usas el archivo `.env` que está en tu máquina. En producción (Vercel), ese archivo no existe porque está en `.gitignore`. Debes configurar las variables en el dashboard de Vercel.

### ¿Necesito configurar algo en Railway?

No, tu backend en Railway ya funciona correctamente. El problema está solo en el frontend (Vercel).

### ¿Qué otras variables debería configurar?

Variables recomendadas:

- `VITE_API_URL` - ✅ **REQUERIDA**
- `VITE_WS_URL` - ⚠️ Recomendada (para WebSockets)
- `VITE_GOOGLE_MAPS_API_KEY` - ❌ Opcional

### ¿Cuánto tarda en aplicarse el cambio?

Después del redeploy, los cambios son inmediatos. Si no ves las alertas:

1. Limpia la caché del navegador (Ctrl + Shift + R)
2. Verifica en modo incógnito
3. Revisa la página `/debug`

## 🆘 Si Aún No Funciona

Si después de seguir estos pasos las alertas siguen sin aparecer:

1. Ve a `/debug` y toma captura de pantalla
2. Abre DevTools (F12) → Console y toma captura
3. Abre DevTools (F12) → Network → busca `/alert` y toma captura
4. Verifica que la variable esté en "Production" environment en Vercel
5. Verifica que hiciste redeploy DESPUÉS de agregar la variable

## ✨ Resultado Esperado

Después de aplicar la solución, deberías ver:

- ✅ 4 alertas en el mapa (las que devuelve tu backend)
- ✅ Marcadores clickeables en las coordenadas correctas
- ✅ Popups con información de cada alerta
- ✅ Estadísticas actualizadas (alertas activas, críticas, etc.)

---

**Creado**: 2024
**Última actualización**: Hoy
