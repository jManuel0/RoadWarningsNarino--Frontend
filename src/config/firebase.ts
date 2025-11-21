/**
 * Configuración de Firebase Cloud Messaging (FCM)
 * Para notificaciones push en tiempo real
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

// Configuración de Firebase
// IMPORTANTE: Reemplazar con tus credenciales de Firebase Console
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Verificar si Firebase está configurado
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Inicializar Firebase App
 */
export const initializeFirebase = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    console.warn(
      "⚠️ Firebase no está configurado. Agrega las variables de entorno en .env"
    );
    return null;
  }

  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase inicializado correctamente");
    } catch (error) {
      console.error("❌ Error al inicializar Firebase:", error);
      return null;
    }
  }

  return app;
};

/**
 * Obtener instancia de Firebase Messaging
 */
export const getFirebaseMessaging = (): Messaging | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!messaging) {
    const firebaseApp = initializeFirebase();
    if (firebaseApp) {
      try {
        messaging = getMessaging(firebaseApp);
        console.log("✅ Firebase Messaging inicializado");
      } catch (error) {
        console.error("❌ Error al inicializar Firebase Messaging:", error);
        return null;
      }
    }
  }

  return messaging;
};

/**
 * Exportar configuración para debugging
 */
export const getFirebaseConfig = () => ({
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "***HIDDEN***" : "NOT_SET",
});
