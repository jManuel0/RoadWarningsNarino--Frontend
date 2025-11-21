/**
 * Firebase Cloud Messaging Service Worker
 * Maneja notificaciones push en background
 */

// Importar scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase
// IMPORTANTE: Debe coincidir con src/config/firebase.ts
const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_AUTH_DOMAIN',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejar mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('📨 [firebase-messaging-sw.js] Mensaje recibido en background:', payload);

  const notificationTitle = payload.notification?.title || 'Nueva Alerta Vial';
  const notificationOptions = {
    body: payload.notification?.body || 'Se ha reportado una nueva alerta',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.alertId || 'default',
    data: payload.data,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'Ver Alerta',
        icon: '/icons/icon-72x72.png',
      },
      {
        action: 'close',
        title: 'Cerrar',
      },
    ],
  };

  // Agregar información adicional según el tipo de alerta
  if (payload.data?.alertType) {
    const alertTypes = {
      DERRUMBE: '🪨',
      ACCIDENTE: '🚗',
      INUNDACION: '🌊',
      CIERRE_VIAL: '🚧',
      MANTENIMIENTO: '🔧',
    };

    const emoji = alertTypes[payload.data.alertType] || '⚠️';
    notificationOptions.icon = payload.notification?.icon || '/icons/icon-192x192.png';
    notificationOptions.body = `${emoji} ${notificationOptions.body}`;
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en las notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Abrir la app en la página de alertas
    const urlToOpen = event.notification.data?.alertId
      ? `/alerts?id=${event.notification.data.alertId}`
      : '/alerts';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

console.log('✅ Firebase Messaging Service Worker cargado correctamente');
