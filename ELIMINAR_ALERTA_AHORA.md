# 🗑️ ELIMINAR ALERTA ID: 1 - PASO A PASO

## Método 1: Desde Railway (MÁS RÁPIDO - 30 segundos)

1. **Abre Railway**: https://railway.app
2. **Selecciona tu proyecto**: roadwarningsnarino-backend
3. **Haz clic en**: Postgres
4. **Haz clic en**: Database (pestaña superior)
5. **Busca**: Una pestaña que diga "Query" o un ícono ⚡
6. **Pega este código**:
   ```sql
   DELETE FROM alerts WHERE id = 1;
   ```
7. **Haz clic en**: Execute / Run / Ejecutar
8. **Verifica**:
   ```sql
   SELECT * FROM alerts ORDER BY id;
   ```
9. **Deberías ver**: Solo 3 alertas (IDs: 2, 3, 4)

✅ LISTO - La alerta fantasma está eliminada

---

## Método 2: Si no encuentras "Query" en Railway

1. **En Railway**, busca un botón que diga "Connect" o "CLI"
2. **Se abrirá una terminal**
3. **Escribe**:
   ```bash
   psql
   ```
4. **Luego escribe**:
   ```sql
   DELETE FROM alerts WHERE id = 1;
   ```
5. **Presiona Enter**
6. **Escribe** para verificar:
   ```sql
   SELECT * FROM alerts;
   ```
7. **Escribe** para salir:
   ```
   \q
   ```

✅ LISTO

---

## ⚠️ Si ninguno funciona

Envíame una captura de pantalla de Railway mostrando:

- Las pestañas disponibles en Postgres
- Los botones que ves

Y te diré exactamente dónde hacer clic.
