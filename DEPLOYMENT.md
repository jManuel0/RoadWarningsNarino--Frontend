# Guía de Deployment - Road Warnings Frontend

Esta guía te llevará paso a paso por el proceso de deployment del frontend a producción.

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Preparación](#preparación)
- [Deployment en Vercel](#deployment-en-vercel)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Configuración de CI/CD](#configuración-de-cicd)
- [Verificación Post-Deployment](#verificación-post-deployment)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)

---

## 🔧 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Node.js >= 18.0.0 instalado
- [ ] Git instalado y configurado
- [ ] Cuenta de GitHub
- [ ] Cuenta de Vercel (gratis)
- [ ] Backend en producción con URL conocida
- [ ] Google Maps API Key (opcional)

---

## 📦 Preparación

### 1. Verificar que Todo Funciona Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Verificar lint
npm run lint

# Type checking
npm run type-check

# Build local
npm run build

# Preview del build
npm run preview
```

**✅ Todos los comandos deben ejecutarse sin errores**

### 2. Verificar Variables de Entorno

Asegúrate de tener un archivo `.env.example` actualizado:

```env
VITE_API_URL=https://tu-backend-prod.com/api
VITE_WS_URL=wss://tu-backend-prod.com/ws
VITE_GOOGLE_MAPS_API_KEY=optional-key
VITE_USE_MOCK=false
```

### 3. Analizar Bundle Size

```bash
# Generar análisis de bundle
npm run build:analyze

# Se abrirá un reporte en tu navegador
# Verifica que el tamaño total sea razonable (< 1MB ideal)
```

### 4. Commit y Push

```bash
git add .
git commit -m "chore: preparar para deployment"
git push origin main
```

---

## 🚀 Deployment en Vercel

### Opción A: Deployment via Web UI (Recomendado para primera vez)

#### Paso 1: Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Import tu repositorio de GitHub
4. Selecciona "roadwarnings-frontend"

#### Paso 2: Configurar Proyecto

**Framework Preset:** Vite
**Root Directory:** `./` (default)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

#### Paso 3: Variables de Entorno

Click en "Environment Variables" y agrega:

| Name                       | Value                        | Environment |
| -------------------------- | ---------------------------- | ----------- |
| `VITE_API_URL`             | `https://tu-backend.com/api` | Production  |
| `VITE_WS_URL`              | `wss://tu-backend.com/ws`    | Production  |
| `VITE_GOOGLE_MAPS_API_KEY` | `tu-api-key`                 | Production  |
| `VITE_USE_MOCK`            | `false`                      | Production  |

**IMPORTANTE:** También agrégalas para Preview y Development si necesario.

#### Paso 4: Deploy

1. Click en "Deploy"
2. Espera a que termine el build (2-5 minutos)
3. ✅ Tu sitio estará en: `https://tu-proyecto.vercel.app`

### Opción B: Deployment via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod

# Seguir los prompts en pantalla
```

---

## ⚙️ Configuración de Variables de Entorno

### En Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable:

```
VITE_API_URL → https://api.tudominio.com/api
VITE_WS_URL → wss://api.tudominio.com/ws
VITE_GOOGLE_MAPS_API_KEY → AIza...
```

### Desde CLI

```bash
# Agregar variable de entorno
vercel env add VITE_API_URL production

# Listar variables
vercel env ls

# Remover variable
vercel env rm VITE_API_URL production
```

### Variables Requeridas vs Opcionales

**✅ REQUERIDAS:**

- `VITE_API_URL` - URL de tu backend

**⚠️ RECOMENDADAS:**

- `VITE_WS_URL` - Para funcionalidad real-time

**❌ OPCIONALES:**

- `VITE_GOOGLE_MAPS_API_KEY` - Solo si usas Google Maps
- `VITE_USE_MOCK` - Solo para desarrollo/testing

---

## 🔄 Configuración de CI/CD

### GitHub Secrets

Para que los workflows de GitHub Actions funcionen, configura estos secrets:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

**Secrets necesarios:**

```
VITE_API_URL_PROD=https://tu-backend-prod.com/api
VITE_WS_URL_PROD=wss://tu-backend-prod.com/ws
VITE_GOOGLE_MAPS_API_KEY=tu-api-key
VERCEL_TOKEN=tu-vercel-token
VERCEL_ORG_ID=tu-org-id
VERCEL_PROJECT_ID=tu-project-id
```

### Obtener Vercel Tokens

```bash
# 1. Obtener Vercel Token
# Ve a: https://vercel.com/account/tokens
# Crea un nuevo token y cópialo

# 2. Obtener Vercel Org ID y Project ID
vercel link

# Los IDs se guardarán en .vercel/project.json
cat .vercel/project.json
```

### Verificar Workflows

```bash
# Hacer un push a main
git push origin main

# Los workflows se ejecutarán automáticamente
# Verifica en: https://github.com/tu-usuario/tu-repo/actions
```

**Workflows configurados:**

- ✅ CI: Se ejecuta en push/PR (lint, test, build)
- ✅ Deploy: Se ejecuta solo en push a main

---

## ✅ Verificación Post-Deployment

### Checklist de Verificación

Una vez deployado, verifica:

#### 1. Funcionalidad Básica

- [ ] El sitio carga correctamente
- [ ] No hay errores en console
- [ ] El routing funciona (prueba varias páginas)
- [ ] El tema claro/oscuro funciona

#### 2. Integración con Backend

- [ ] Login funciona
- [ ] Registro funciona
- [ ] Se pueden cargar alertas
- [ ] WebSocket conecta correctamente

#### 3. Mapas

- [ ] Los mapas cargan correctamente
- [ ] Los marcadores aparecen
- [ ] El clustering funciona
- [ ] La navegación GPS funciona

#### 4. Performance

- [ ] PageSpeed Insights > 90
- [ ] Tiempo de carga < 3 segundos
- [ ] No hay warnings de bundle size

#### 5. Seguridad

- [ ] HTTPS funciona
- [ ] CSP headers presentes
- [ ] No hay mixed content warnings
- [ ] Security headers activos

### Herramientas de Verificación

```bash
# 1. Lighthouse
# Abre DevTools → Lighthouse → Run audit

# 2. Check bundle size
npm run build:analyze

# 3. Check security headers
curl -I https://tu-proyecto.vercel.app

# 4. WebSocket test
# Abre console y verifica conexión WS
```

---

## 🐛 Troubleshooting

### Problema: Build Falla

**Error:** `Type error: ...`

```bash
# Solución: Verificar types localmente
npm run type-check

# Fix errores y rebuild
npm run build
```

**Error:** `Module not found`

```bash
# Solución: Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Variables de Entorno No Funcionan

**Síntoma:** API calls fallan, undefined variables

```bash
# 1. Verificar que las variables existen en Vercel
vercel env ls

# 2. Verificar que empiezan con VITE_
# ❌ API_URL (no funciona)
# ✅ VITE_API_URL (funciona)

# 3. Re-deploy después de agregar variables
vercel --prod
```

### Problema: CORS Errors

**Síntoma:** `Access-Control-Allow-Origin error`

**Solución:** Configurar CORS en el backend:

```java
// Backend debe permitir:
Access-Control-Allow-Origin: https://tu-proyecto.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Problema: WebSocket No Conecta

**Síntoma:** WebSocket connection failed

```bash
# 1. Verificar URL
console.log(import.meta.env.VITE_WS_URL)

# 2. Debe ser wss:// (no ws://) en producción

# 3. Verificar que backend acepta WebSocket
# Check firewall/load balancer settings
```

### Problema: Build Size Muy Grande

```bash
# Analizar bundle
npm run build:analyze

# Optimizaciones:
# 1. Verificar que lazy loading está activo
# 2. Remover imports no usados
# 3. Usar dynamic imports
```

---

## ⏪ Rollback

### Si algo sale mal en producción:

#### Opción 1: Rollback via Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Deployments
3. Encuentra el deployment anterior estable
4. Click "..." → "Promote to Production"

#### Opción 2: Rollback via Git

```bash
# Revertir al commit anterior
git revert HEAD
git push origin main

# O reset a commit específico
git reset --hard <commit-hash>
git push -f origin main
```

#### Opción 3: Redeploy desde CLI

```bash
# Deploy una versión específica
git checkout <commit-hash>
vercel --prod
```

---

## 📊 Monitoreo Post-Deployment

### Métricas a Monitorear

1. **Vercel Analytics** (incluido gratis)
   - Real User Monitoring
   - Core Web Vitals
   - Traffic analytics

2. **Vercel Speed Insights** (ya integrado)
   - Performance score
   - Tiempo de carga

3. **Error Tracking** (opcional - Sentry)
   - JavaScript errors
   - Network errors
   - Performance issues

### Logs

```bash
# Ver logs en tiempo real
vercel logs tu-proyecto.vercel.app --follow

# Ver logs de función específica
vercel logs tu-proyecto.vercel.app -f
```

---

## 🎯 Checklist Final

Antes de considerar el deployment completo:

### Pre-Deployment

- [ ] Tests pasan localmente
- [ ] Build sin errores
- [ ] Lint sin errores
- [ ] Type-check pasa
- [ ] Bundle size analizado
- [ ] Variables de entorno documentadas

### Deployment

- [ ] Conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Custom domain configurado (opcional)
- [ ] GitHub secrets configurados
- [ ] Workflows ejecutándose correctamente

### Post-Deployment

- [ ] Sitio carga correctamente
- [ ] Funcionalidad principal verificada
- [ ] Performance > 90 (Lighthouse)
- [ ] Security headers activos
- [ ] Monitoring configurado
- [ ] Equipo notificado

---

## 📞 Soporte

Si tienes problemas:

1. **Vercel Docs:** https://vercel.com/docs
2. **Vite Docs:** https://vitejs.dev/guide/
3. **GitHub Issues:** Crea un issue en el repositorio
4. **Vercel Support:** support@vercel.com (pro plans)

---

## 🎉 ¡Felicitaciones!

Tu aplicación está ahora en producción y accesible globalmente. 🚀

### Próximos Pasos

1. Configurar custom domain (opcional)
2. Setup monitoring y alerts
3. Documentar proceso para el equipo
4. Planear estrategia de releases

---

**Última actualización:** 2025-01-19
**Mantenido por:** Tu Equipo
