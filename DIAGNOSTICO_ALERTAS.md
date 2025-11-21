# 🔍 Diagnóstico: Alerta no aparece después de crearla

## Posibles Causas:

### 1. La alerta se crea pero no se actualiza la lista local

**Síntoma:** Creas la alerta, se cierra el modal, pero no aparece hasta que recargas (F5)

**Solución:** Ya está implementada con `addAlert(newAlert)` en el código

### 2. La alerta se crea con status diferente a ACTIVE

**Síntoma:** La alerta existe en la base de datos pero no aparece en la página

**Causa:** Los filtros por defecto pueden estar ocultándola

**Solución:** Cambia el filtro a "Todos"

### 3. Error al crear la alerta en el backend

**Síntoma:** El modal se cierra pero no pasa nada

**Solución:** Revisar la consola del navegador (F12)

### 4. La alerta se crea pero con coordenadas fuera del área visible

**Síntoma:** La alerta existe pero no la ves en el mapa

**Solución:** Buscarla en la lista de alertas

---

## 🧪 Pasos para Diagnosticar:

### Paso 1: Verifica en la consola del navegador

1. Presiona **F12**
2. Ve a la pestaña **Console**
3. Intenta crear una alerta
4. Busca mensajes de error en rojo

**Errores comunes:**

- `401 Unauthorized` → No estás autenticado
- `403 Forbidden` → No tienes permisos
- `400 Bad Request` → Faltan datos obligatorios
- `500 Internal Server Error` → Error en el backend

### Paso 2: Verifica en la pestaña Network

1. Presiona **F12** → **Network**
2. Intenta crear una alerta
3. Busca la petición `POST /api/alert`
4. Haz clic en ella
5. Ve a la pestaña **Response**

**Respuestas esperadas:**

- **200 OK** → Alerta creada correctamente
- **201 Created** → Alerta creada correctamente
- Cualquier otro código → Hay un error

### Paso 3: Verifica en la base de datos

1. Ve a Railway → Postgres → Database → Data
2. Busca la tabla `alerts`
3. Ordena por `created_at` descendente
4. Verifica si tu alerta está ahí

### Paso 4: Verifica los filtros

1. En la página de alertas, cambia:
   - **Estado:** "Todos"
   - **Severidad:** "Todas"
2. Limpia el campo de búsqueda
3. Busca tu alerta

---

## ✅ Soluciones Rápidas:

### Solución 1: Recargar después de crear

Agrega un `window.location.reload()` después de crear:

```typescript
const newAlert = await alertApi.createAlert(alertData);
addAlert(newAlert);
setShowCreateModal(false);
window.location.reload(); // ← Agregar esto
```

### Solución 2: Verificar que los datos se envían correctamente

Agrega un `console.log` antes de enviar:

```typescript
console.log("Creando alerta:", alertData);
const newAlert = await alertApi.createAlert(alertData);
console.log("Alerta creada:", newAlert);
```

### Solución 3: Mostrar mensaje de éxito

```typescript
const newAlert = await alertApi.createAlert(alertData);
addAlert(newAlert);
alert("¡Alerta creada exitosamente!");
setShowCreateModal(false);
```

---

## 🎯 Prueba Esto AHORA:

1. **Abre tu sitio web**
2. **Presiona F12** (deja la consola abierta)
3. **Intenta crear una alerta**
4. **Toma captura de pantalla de:**
   - La consola (Console tab)
   - La petición POST /api/alert (Network tab)
5. **Comparte las capturas**

---

## 💡 Preguntas para ti:

1. ¿El modal se cierra después de crear la alerta?
2. ¿Ves algún mensaje de error?
3. ¿La alerta aparece si recargas la página (F5)?
4. ¿La alerta aparece en Railway (base de datos)?
5. ¿Qué filtros tienes seleccionados? (Estado y Severidad)

---

## 🔧 Si la alerta SÍ aparece al recargar:

Entonces el problema es que `addAlert()` no está funcionando correctamente.

**Solución temporal:**
Recarga la página automáticamente después de crear:

```typescript
const newAlert = await alertApi.createAlert(alertData);
window.location.reload();
```

**Solución permanente:**
Revisar el store de Zustand para asegurarse de que `addAlert` actualiza correctamente el estado.
