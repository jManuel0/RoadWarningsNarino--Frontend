# 🔐 Configuración de Permisos en el Backend

## Para el desarrollador del Backend

Necesitas modificar el endpoint `DELETE /api/alert/{id}` para permitir eliminar alertas.

---

## ✅ Solución Recomendada (Copia y pega esto)

### Archivo: AlertController.java (o similar)

```java
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteAlert(
    @PathVariable Long id,
    @AuthenticationPrincipal UserDetails currentUser
) {
    try {
        // Buscar la alerta
        Alert alert = alertRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada"));

        // Obtener ID del usuario actual
        Long currentUserId = currentUser != null ? currentUser.getId() : null;

        // Obtener rol del usuario (ajusta según tu implementación)
        boolean isAdmin = currentUser != null &&
            currentUser.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        // REGLAS DE ELIMINACIÓN:
        // 1. Si es ADMIN → puede eliminar cualquier alerta
        // 2. Si la alerta no tiene userId (null) → cualquiera puede eliminar
        // 3. Si es el creador → puede eliminar su propia alerta

        boolean canDelete = isAdmin ||
                           alert.getUserId() == null ||
                           (currentUserId != null && currentUserId.equals(alert.getUserId()));

        if (!canDelete) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "No tienes permisos para eliminar esta alerta"));
        }

        // Eliminar la alerta
        alertRepository.deleteById(id);

        return ResponseEntity.ok()
            .body(Map.of("message", "Alerta eliminada correctamente"));

    } catch (ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Alerta no encontrada"));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Error al eliminar la alerta: " + e.getMessage()));
    }
}
```

---

## 🚀 Alternativa Simple (Solo para desarrollo/testing)

Si quieres permitir que cualquier usuario autenticado elimine cualquier alerta temporalmente:

```java
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteAlert(@PathVariable Long id) {
    try {
        if (!alertRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        alertRepository.deleteById(id);
        return ResponseEntity.ok().build();

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}
```

⚠️ **ADVERTENCIA**: Esta versión no tiene seguridad. Solo úsala para testing.

---

## 📋 Checklist para el Backend

Después de hacer los cambios:

- [ ] Modificar el endpoint DELETE /api/alert/{id}
- [ ] Implementar las reglas de permisos
- [ ] Hacer commit de los cambios
- [ ] Push a Railway
- [ ] Esperar que se complete el deploy (1-2 minutos)
- [ ] Probar desde el frontend

---

## 🧪 Cómo Probar

### Desde curl:

```bash
# Obtener tu token desde el navegador (F12 → Console):
# localStorage.getItem('auth-storage')

curl -X DELETE \
  "https://roadwarningsnarino-backend-production.up.railway.app/api/alert/1" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Respuestas esperadas:

- **200 OK**: Alerta eliminada correctamente
- **403 Forbidden**: No tienes permisos
- **404 Not Found**: Alerta no existe
- **401 Unauthorized**: Token inválido o expirado

---

## 💡 Mejoras Adicionales (Opcional)

### 1. Agregar logs:

```java
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteAlert(@PathVariable Long id, @AuthenticationPrincipal UserDetails currentUser) {
    log.info("Usuario {} intentando eliminar alerta {}",
        currentUser != null ? currentUser.getUsername() : "anónimo",
        id);

    // ... resto del código

    log.info("Alerta {} eliminada exitosamente por {}",
        id,
        currentUser.getUsername());
}
```

### 2. Soft delete (marcar como eliminada en vez de borrar):

```java
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteAlert(@PathVariable Long id) {
    Alert alert = alertRepository.findById(id).orElseThrow();
    alert.setStatus(AlertStatus.DELETED);
    alert.setDeletedAt(LocalDateTime.now());
    alertRepository.save(alert);
    return ResponseEntity.ok().build();
}
```

---

## 🆘 Si tienes dudas

Pregunta específicamente:

- ¿Cómo obtengo el usuario actual en mi backend?
- ¿Cómo verifico si un usuario es ADMIN?
- ¿Dónde está mi AlertController?
- ¿Cómo hago deploy en Railway?
