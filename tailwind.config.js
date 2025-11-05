/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 Agregar esta línea
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}