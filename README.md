# OSMI Barberstudio - Astro + Tailwind

Landing de barberia con sistema de reservas:
- UI en Astro + Tailwind.
- API interna (`/api/book`) con validacion.
- Persistencia en Google Sheets via Google Apps Script.
- Enlace `wa.me` prellenado para notificar al barbero.

## Stack

- Astro 6
- Tailwind CSS 4
- Endpoint server-side de Astro

## Estructura clave

- `src/pages/index.astro`: landing principal con hero, servicios y formulario.
- `src/components/BookingForm.astro`: formulario y flujo cliente.
- `src/pages/api/book.ts`: endpoint para guardar reserva y generar enlace WhatsApp.
- `public/brand/osmi-logo.png`: logo OSMI.
- `docs/google-apps-script.gs`: script sugerido para Google Sheets.

## Variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Configura valores reales en `.env`:

```env
GOOGLE_SCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/TU_WEBAPP_ID/exec"
GOOGLE_SCRIPT_API_KEY="tu-clave-compartida-opcional"
BARBER_WHATSAPP_NUMBER="51999111222"
```

## Configurar Google Sheets + Apps Script

1. Crea un Google Sheet nuevo.
2. En `Extensions > Apps Script`, pega el contenido de `docs/google-apps-script.gs`.
3. Ajusta:
   - `SHEET_NAME`
   - `API_KEY` (debe coincidir con `GOOGLE_SCRIPT_API_KEY`)
4. Deploy:
   - `Deploy > New deployment`
   - Tipo: `Web app`
   - Acceso: `Anyone` (o segun tu politica)
5. Copia la URL final del Web App y asignala a `GOOGLE_SCRIPT_WEBHOOK_URL`.

Columnas gestionadas automaticamente:
- `timestamp`
- `name`
- `phone`
- `service`
- `date`
- `time`
- `notes`
- `status`

## Desarrollo local

```bash
npm install
npm run dev
```

App local: `http://localhost:4321`

## Flujo de reserva

1. Cliente envia formulario.
2. `/api/book` valida y normaliza datos.
3. Endpoint envia la reserva a Apps Script.
4. Si se guarda con exito, el frontend muestra boton para abrir WhatsApp del barbero.

## Paleta de marca (extraida del logo)

- `#222223` fondo principal
- `#3D4144` superficies
- `#595C5F` bordes y secundarios
- `#999DA0` texto secundario
- `#D9DEE1` texto principal/acento

## Comandos utiles

- `npm run dev`: entorno de desarrollo.
- `npm run build`: build de produccion.
- `npm run preview`: previsualizar build.
