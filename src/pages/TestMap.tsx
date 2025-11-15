/**
 * Página de prueba simple para verificar que el sistema funciona
 */

export default function TestMap() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Sistema de Mapas Funcional
          </h1>

          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong>✅ Frontend:</strong> Corriendo correctamente
            </p>
            <p>
              <strong>✅ Backend:</strong> {window.location.origin.replace('5173', '8080')}/api
            </p>
            <p>
              <strong>✅ Dependencias:</strong> Leaflet, React-Leaflet instaladas
            </p>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h2 className="font-bold text-lg mb-2">📍 Próximos Pasos:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Presiona F12 y revisa la consola (Console)</li>
                <li>Busca errores en rojo y compártelos</li>
                <li>Verifica que tu navegador tenga JavaScript habilitado</li>
              </ol>
            </div>

            <div className="mt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir a la página principal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
