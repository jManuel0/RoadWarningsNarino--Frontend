# Configuración de Firebase Cloud Messaging (FCM)

Esta guía te ayudará a configurar las notificaciones push en RoadWarnings usando Firebase Cloud Messaging.

## 📋 Requisitos previos

- Cuenta de Google
- Proyecto de Firebase (puede ser nuevo o existente)
- Acceso al proyecto frontend

## 🚀 Pasos de configuración

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o selecciona un proyecto existente
3. Sigue el asistente de configuración:
   - Nombre del proyecto: `roadwarnings-narino` (o el nombre que prefieras)
   - Acepta los términos y condiciones
   - Habilita Google Analytics (opcional pero recomendado)

### 2. Agregar aplicación web al proyecto

1. En la página principal del proyecto, haz clic en el ícono **Web** (</>) para agregar una app web
2. Registra la aplicación:
   - Nombre de la app: `RoadWarnings Frontend`
   - ✅ Marca "También configurar Firebase Hosting" (opcional)
3. Haz clic en **"Registrar app"**

### 3. Obtener credenciales de Firebase

Firebase te mostrará un objeto de configuración similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "roadwarnings-narino.firebaseapp.com",
  projectId: "roadwarnings-narino",
  storageBucket: "roadwarnings-narino.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX",
};
```

### 4. Habilitar Firebase Cloud Messaging

1. En el menú lateral de Firebase Console, ve a **"Messaging"** (debajo de "Interactuar")
2. Si es la primera vez, haz clic en **"Comenzar"**
3. Acepta los términos y condiciones de Cloud Messaging

### 5. Generar certificado VAPID

1. En Firebase Console, haz clic en el ícono de engranaje ⚙️ (arriba a la izquierda)
2. Selecciona **"Configuración del proyecto"**
3. Ve a la pestaña **"Cloud Messaging"**
4. En la sección **"Certificados push web"**, busca **"Pares de claves web push (VAPID)"**
5. Si no hay ninguno, haz clic en **"Generar par de claves"**
6. Copia la **Clave pública** (comenzará con `B...`)

### 6. Configurar variables de entorno

Crea o edita el archivo `.env.production` en la raíz del proyecto frontend:

```bash
# Backend API URLs
VITE_API_URL=https://roadwarningsnarino-backend-production.up.railway.app/api
VITE_WS_URL=wss://roadwarningsnarino-backend-production.up.railway.app/api/ws

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=roadwarnings-narino.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=roadwarnings-narino
VITE_FIREBASE_STORAGE_BUCKET=roadwarnings-narino.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase VAPID Key
VITE_FIREBASE_VAPID_KEY=BPzXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Para desarrollo local, crea también `.env.development` con las mismas variables.

### 7. Actualizar Service Worker de Firebase

Edita `public/firebase-messaging-sw.js` y actualiza la configuración de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY", // ← Reemplazar
  authDomain: "TU_AUTH_DOMAIN", // ← Reemplazar
  projectId: "TU_PROJECT_ID", // ← Reemplazar
  storageBucket: "TU_STORAGE_BUCKET", // ← Reemplazar
  messagingSenderId: "TU_SENDER_ID", // ← Reemplazar
  appId: "TU_APP_ID", // ← Reemplazar
};
```

## 🧪 Probar las notificaciones

### Desde el Frontend

1. Compila y despliega la aplicación:

   ```bash
   npm run build
   npm run preview
   ```

2. Abre la aplicación en el navegador (debe ser HTTPS en producción)

3. Inicia sesión en la aplicación

4. Deberías ver un banner solicitando permiso para notificaciones

5. Haz clic en **"Activar"**

6. Ve a **Perfil** → **Configuración de Notificaciones**

7. Haz clic en **"Enviar notificación de prueba"**

### Desde Firebase Console

1. Ve a Firebase Console → **Messaging**

2. Haz clic en **"Enviar tu primer mensaje"**

3. Completa el formulario:
   - **Título**: "Prueba de Notificación"
   - **Texto**: "Las notificaciones están funcionando correctamente"

4. Haz clic en **"Siguiente"**

5. Selecciona tu aplicación web

6. Haz clic en **"Revisar"** y luego **"Publicar"**

## 🔧 Configuración del Backend (Spring Boot)

El backend también necesita configuración de Firebase para enviar notificaciones:

### 1. Generar clave privada del servidor

1. En Firebase Console → **Configuración del proyecto** → **Cuentas de servicio**
2. Haz clic en **"Generar nueva clave privada"**
3. Descarga el archivo JSON (guardarlo de forma segura, **NO subirlo a Git**)

### 2. Configurar Spring Boot

Agrega las siguientes dependencias a `pom.xml`:

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

### 3. Crear servicio de notificaciones

El backend debe implementar un servicio que:

1. Inicialice Firebase Admin SDK con la clave privada
2. Guarde los tokens FCM de los usuarios en la base de datos
3. Envíe notificaciones cuando se creen nuevas alertas

**Endpoints necesarios:**

- `POST /api/notifications/subscribe` - Guardar token FCM del usuario
- `POST /api/notifications/unsubscribe` - Eliminar token FCM del usuario
- `GET /api/notifications/preferences` - Obtener preferencias de notificación

## 📱 Características implementadas

- ✅ Solicitud de permisos con banner amigable
- ✅ Notificaciones en primer plano (app abierta)
- ✅ Notificaciones en segundo plano (app cerrada)
- ✅ Configuración de preferencias:
  - Solo alertas críticas
  - Sonido activado/desactivado
  - Vibración activada/desactivada
  - Radio de notificación (5-100 km)
- ✅ Notificación de prueba
- ✅ Integración con página de perfil
- ✅ Caché de tokens en localStorage
- ✅ Service Worker para background notifications

## 🐛 Solución de problemas

### Las notificaciones no aparecen

**Verificar permisos:**

- En Chrome: `chrome://settings/content/notifications`
- Asegúrate de que el sitio tenga permisos concedidos

**Verificar HTTPS:**

- Las notificaciones push requieren HTTPS (excepto en localhost)

**Verificar Service Worker:**

- Abre DevTools → Application → Service Workers
- Debe aparecer `firebase-messaging-sw.js` como activo

**Verificar consola:**

- Abre DevTools → Console
- Busca errores de Firebase o FCM

### "Firebase no está configurado"

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env.production` exista
- Reconstruye el proyecto: `npm run build`

### "No se pudo obtener el token de FCM"

- Verifica que el VAPID key sea correcto
- Asegúrate de que Firebase Cloud Messaging esté habilitado en Firebase Console
- Revisa que el navegador soporte notificaciones push

### Notificaciones duplicadas

- Verifica que no haya múltiples service workers registrados
- Limpia la caché del navegador
- Desregistra service workers antiguos

## 📚 Recursos adicionales

- [Documentación oficial de FCM](https://firebase.google.com/docs/cloud-messaging)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/reference/js)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🔒 Seguridad

**⚠️ IMPORTANTE:**

- **NUNCA** subas las claves privadas de Firebase a Git
- Agrega `.env*` al `.gitignore` (ya debería estar)
- No compartas el archivo JSON de la cuenta de servicio
- Usa variables de entorno para todas las credenciales
- En producción, restringe las API keys en Firebase Console

## 📊 Monitoreo

Para monitorear el uso de notificaciones:

1. Firebase Console → **Messaging** → **Dashboard**
2. Firebase Console → **Analytics** (si está habilitado)

Aquí podrás ver:

- Notificaciones enviadas
- Tasa de apertura
- Dispositivos activos
- Errores de entrega

---

**¿Necesitas ayuda?** Revisa los logs del navegador y de Firebase Console para más detalles sobre errores.
