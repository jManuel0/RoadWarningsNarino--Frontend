# ✅ Checklist: Configuración de Vercel

Usa este checklist para asegurarte de que todo está configurado correctamente.

## 📋 Antes de Configurar Vercel

- [ ] El backend en Railway funciona correctamente
- [ ] Puedes hacer `curl` al endpoint y recibes alertas
- [ ] El proyecto compila sin errores localmente (`npm run build`)
- [ ] Las alertas aparecen en desarrollo local (`npm run dev`)

## 🔧 Configuración en Vercel

### Variables de Entorno

- [ ] Accediste al dashboard de Vercel
- [ ] Seleccionaste tu proyecto
- [ ] Fuiste a Settings → Environment Variables
- [ ] Agregaste `VITE_API_URL` con el valor correcto
- [ ] Seleccionaste el ambiente "Production"
- [ ] Guardaste los cambios

**Valor correcto**:

```
https://roadwarningsnarino-backend-production.up.railway.app/api
```

### Redeploy

- [ ] Fuiste a la pestaña "Deployments"
- [ ] Encontraste el último deployment
- [ ] Hiciste clic en "..." → "Redeploy"
- [ ] Esperaste a que termine el build (status: Ready)

## 🧪 Verificación

### Página de Debug

- [ ] Visitaste `https://tu-dominio.vercel.app/debug`
- [ ] La variable `VITE_API_URL` muestra la URL correcta
- [ ] El botón "Probar con Fetch" devuelve éxito
- [ ] Se muestran las 4 alertas en la respuesta

### Consola del Navegador

- [ ] Abriste DevTools (F12)
- [ ] Fuiste a la pestaña "Console"
- [ ] No hay errores en rojo
- [ ] Ves el mensaje "✅ X alertas cargadas"

### Network Tab

- [ ] Abriste DevTools (F12) → Network
- [ ] Recargaste la página (F5)
- [ ] Buscaste la petición a `/alert`
- [ ] El Request URL apunta a Railway (no a localhost)
- [ ] El Status es 200 OK
- [ ] La Response muestra las alertas

### Mapa

- [ ] El mapa se carga correctamente
- [ ] Aparecen 4 marcadores en el mapa
- [ ] Los marcadores están en las coordenadas correctas
- [ ] Puedes hacer clic en los marcadores
- [ ] Los popups muestran información correcta
- [ ] Las estadísticas muestran números correctos

## 🎯 Resultado Final

Si todos los checkboxes están marcados, tu aplicación debería estar funcionando correctamente.

### Estadísticas Esperadas

Basado en las 4 alertas de tu backend:

```json
[
  { "id": 2, "type": "DERRUMBE", "severity": "MEDIUM", "status": "ACTIVE" },
  { "id": 3, "type": "ACCIDENTE", "severity": "HIGH", "status": "ACTIVE" },
  { "id": 4, "type": "DERRUMBE", "severity": "MEDIUM", "status": "ACTIVE" },
  { "id": 1, "type": "ACCIDENTE", "severity": "MEDIUM", "status": "RESOLVED" }
]
```

Deberías ver:

- **Alertas Activas**: 3 (las que tienen status: ACTIVE)
- **Alertas Críticas**: 0 (ninguna tiene severity: CRITICAL)
- **Total Alertas**: 4

## 🚨 Problemas Comunes

### ❌ La variable no aparece en /debug

**Causa**: No hiciste redeploy después de agregar la variable.

**Solución**: Ve a Deployments → Redeploy

---

### ❌ Request URL apunta a localhost

**Causa**: La variable no está configurada o el nombre es incorrecto.

**Solución**:

- Verifica que el nombre sea `VITE_API_URL` (con guión bajo)
- Verifica que esté en el ambiente "Production"
- Haz redeploy

---

### ❌ Error 404 en /alert

**Causa**: La URL de la API está mal configurada.

**Solución**:

- Verifica que la URL termine en `/api` (sin `/alert`)
- Correcto: `https://...railway.app/api`
- Incorrecto: `https://...railway.app/api/alert`

---

### ❌ Error CORS

**Causa**: El backend no permite peticiones desde tu dominio de Vercel.

**Solución**:

- Configura CORS en tu backend de Railway
- Agrega tu dominio de Vercel a los orígenes permitidos

---

### ❌ Solo aparecen 3 alertas en el mapa

**Causa**: La alerta con `status: RESOLVED` se filtra automáticamente.

**Solución**:

- Esto es correcto, el mapa solo muestra alertas activas
- Si quieres ver todas, ve a la página `/alerts`

## 📞 Soporte

Si después de completar este checklist sigues teniendo problemas:

1. Toma capturas de pantalla de:
   - [ ] Página `/debug`
   - [ ] Console (F12)
   - [ ] Network tab mostrando la petición `/alert`
   - [ ] Variables de entorno en Vercel

2. Verifica:
   - [ ] ¿El backend en Railway sigue funcionando?
   - [ ] ¿Hiciste redeploy DESPUÉS de agregar las variables?
   - [ ] ¿Limpiaste la caché del navegador?

---

**Última actualización**: 2024
