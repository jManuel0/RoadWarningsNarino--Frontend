# 🚀 Configuración de Vercel para Road Warnings Nariño

## Problema Identificado

Las alertas del backend en Railway no aparecen en el mapa porque **la variable de entorno `VITE_API_URL` no está configurada en Vercel**.

## Solución: Configurar Variables de Entorno en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado) ✅

1. **Accede a tu proyecto en Vercel**
   - Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto `roadwarningsnarino-frontend` (o el nombre que tenga)

2. **Navega a Settings → Environment Variables**
   - En el menú lateral, haz clic en **Settings**
   - Luego en **Environment Variables**

3. **Agrega la variable de entorno**
   - Haz clic en **Add New**
   - Completa los campos:
     ```
     Name: VITE_API_URL
     Value: https://roadwarningsnarino-backend-production.up.railway.app/api
     ```
   - Selecciona los ambientes donde aplicará:
     - ✅ **Production** (obligatorio)
     - ✅ **Preview** (recomendado)
     - ⬜ **Development** (opcional)

4. **Guarda los cambios**
   - Haz clic en **Save**

5. **Re-deploy tu aplicación** ⚠️ IMPORTANTE
   - Ve a la pestaña **Deployments**
   - Encuentra el último deployment
   - Haz clic en los tres puntos (...) → **Redeploy**
   - Confirma el redeploy

### Opción 2: Desde la CLI de Vercel

Si prefieres usar la terminal:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Login en Vercel
vercel login

# Agregar variable de entorno
vercel env add VITE_API_URL production

# Cuando te pregunte el valor, pega:
# https://roadwarningsnarino-backend-production.up.railway.app/api

# Re-deploy
vercel --prod
```

### Opción 3: Archivo vercel.json (Ya configurado)

Tu proyecto ya tiene un archivo `vercel.json`, pero las variables de entorno **NO** se pueden definir ahí. Deben configurarse en el dashboard o CLI.

## Variables de Entorno Requeridas

| Variable                   | Valor                                                               | Requerido      |
| -------------------------- | ------------------------------------------------------------------- | -------------- |
| `VITE_API_URL`             | `https://roadwarningsnarino-backend-production.up.railway.app/api`  | ✅ Sí          |
| `VITE_WS_URL`              | `wss://roadwarningsnarino-backend-production.up.railway.app/api/ws` | ⚠️ Recomendado |
| `VITE_GOOGLE_MAPS_API_KEY` | Tu API Key de Google Maps                                           | ❌ Opcional    |

## Verificación

### 1. Página de Debug

Después del redeploy, visita:

```
https://tu-dominio.vercel.app/debug
```

Esta página te mostrará:

- ✅ Variables de entorno configuradas
- ✅ URL de la API que se está usando
- ✅ Pruebas de conexión al backend
- ✅ Datos de las alertas recibidas

### 2. Consola del Navegador

1. Abre tu sitio en producción
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Busca mensajes como:
   - ✅ `✅ X alertas cargadas`
   - ❌ `Error al obtener alertas: 404`
   - ❌ `VITE_API_URL is required`

### 3. Network Tab

1. En DevTools, ve a la pestaña **Network**
2. Recarga la página (F5)
3. Busca la petición a `/alert`
4. Verifica:
   - **Request URL**: Debe ser `https://roadwarningsnarino-backend-production.up.railway.app/api/alert`
   - **Status**: Debe ser `200 OK`
   - **Response**: Debe mostrar el array de alertas

## Problemas Comunes

### ❌ Las alertas siguen sin aparecer

**Causa**: No hiciste redeploy después de agregar las variables.

**Solución**:

- Ve a Deployments → ... → Redeploy
- Las variables de entorno solo se aplican en nuevos builds

### ❌ Error: "VITE_API_URL is required"

**Causa**: La variable no está configurada o tiene un nombre incorrecto.

**Solución**:

- Verifica que el nombre sea exactamente `VITE_API_URL` (con guión bajo)
- Verifica que esté en el ambiente "Production"

### ❌ Error: "Failed to fetch" o CORS

**Causa**: El backend en Railway no permite peticiones desde tu dominio de Vercel.

**Solución**:

- Configura CORS en tu backend de Railway
- Agrega tu dominio de Vercel a la lista de orígenes permitidos

### ❌ Las alertas aparecen en local pero no en producción

**Causa**: Estás usando `.env` local pero no configuraste las variables en Vercel.

**Solución**:

- Sigue los pasos de configuración arriba
- Recuerda que `.env` NO se sube a Vercel (está en `.gitignore`)

## Comandos Útiles

```bash
# Ver variables de entorno configuradas
vercel env ls

# Eliminar una variable
vercel env rm VITE_API_URL production

# Ver logs del deployment
vercel logs

# Ver información del proyecto
vercel inspect
```

## Checklist Final ✅

Antes de considerar que todo está funcionando:

- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Redeploy realizado después de agregar la variable
- [ ] Página `/debug` muestra la URL correcta
- [ ] Consola del navegador no muestra errores
- [ ] Network tab muestra petición exitosa a `/alert`
- [ ] Las alertas aparecen en el mapa
- [ ] Los marcadores son clickeables
- [ ] Los popups muestran información correcta

## Soporte

Si después de seguir estos pasos las alertas siguen sin aparecer:

1. Visita `/debug` y toma captura de pantalla
2. Abre DevTools (F12) → Console y toma captura
3. Abre DevTools (F12) → Network → busca `/alert` y toma captura
4. Comparte las capturas para diagnóstico adicional

---

**Última actualización**: 2024
**Autor**: Sistema de Alertas Viales Nariño
