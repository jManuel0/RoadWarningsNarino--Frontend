import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeContext.tsx'
import './index.css'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)


// Desregistrar cualquier Service Worker viejo que pueda romper el build
// Eliminar cualquier Service Worker previo que pueda estar rompiendo la app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      reg.unregister();
      console.log('🧹 Service Worker desregistrado:', reg);
    });
  });
}

