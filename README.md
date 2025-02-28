# whatsapp-bridge

Este proyecto maneja múltiples cuentas de WhatsApp, guarda las sesiones para evitar escanear el QR repetidamente y envía mensajes usando la API.

## Requisitos

- Node.js
- MongoDB
- WhatsApp en tu teléfono (para escanear los QR la primera vez)

## Instalación

1. Clona el repositorio.
2. Instala las dependencias: `npm install`.
3. Configura las variables de entorno en `.env`.
4. Registra las cuentas en la base de datos (usando MongoDB Compass o similar).
5. Crea una carpeta `sessions` en la raíz del proyecto.
6. Inicia el servidor: `npm start`.

## Uso

1. **Primera vez**:

   - Al iniciar el servidor, se generará un QR para cada cuenta registrada.
   - Escanea los QR con la aplicación de WhatsApp para autorizar las sesiones.
   - Las sesiones se guardarán automáticamente en la carpeta `sessions`.

2. **Reinicios posteriores**:

   - Las sesiones se restaurarán automáticamente desde los archivos guardados.
   - No necesitarás escanear el QR nuevamente.

3. **Enviar mensajes**:
   - Usa la API para enviar mensajes:

```json
POST /api/whatsapp/send-message
{
    "accountId": "60d5ec49f1b2c72d88f8e8b5",
    "phoneNumber": "1234567890",
    "message": "Hola, este es un mensaje de prueba"
}
```
