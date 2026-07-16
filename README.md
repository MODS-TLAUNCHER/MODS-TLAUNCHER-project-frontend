# biUNestar - Frontend

Frontend estático (HTML + CSS + JS plano, sin frameworks ni build tools) para
consumir la API de [biUNestar backend](https://github.com/MODS-TLAUNCHER/MODS-TLAUNCHER-project-backend/blob/main/README.md) (FastAPI). Vive en su
propia carpeta, separada del backend, tal como debe estar organizado el
proyecto.

## Configuración

Edita **un solo archivo**: [`js/config.js`](js/config.js)

```js
const CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000",         
  GOOGLE_CLIENT_ID: "TU_GOOGLE_CLIENT_ID...",     
};
```

El `GOOGLE_CLIENT_ID` debe ser idéntico al que configuraste en el `.env` del
backend (`GOOGLE_CLIENT_ID`).

## Cómo correrlo localmente

Google Sign-In **no funciona** abriendo el HTML con doble clic (`file://`).
Tienes que servirlo con un servidor local, por ejemplo:

```bash
cd biUNestar-frontend
python -m http.server 5500
```

y entrar a `http://localhost:5500`.

**Importante**: en [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
agrega ese origen a "Authorized JavaScript origins" de tu OAuth Client ID:

```
http://localhost:5500
```

Y asegúrate de que tu API tenga CORS habilitado para ese origen (ya viene
configurado en `app/main.py` del backend).

## Estructura

```
biUNestar-frontend/
├── index.html          
├── dashboard.html      
├── css/styles.css      
├── js/
│   ├── config.js       
│   ├── api.js          
│   ├── auth.js         
│   └── dashboard.js    
└── assets/             
```

## Cómo se maneja la sesión

- Tras el login con Google, el backend devuelve un JWT propio
  (`access_token`) que se guarda en `localStorage` junto con los datos del
  usuario (`js/api.js` → objeto `Session`).
- Cada llamada a la API pasa por `apiFetch(path, options)`, que agrega
  automáticamente el header `Authorization: Bearer <token>`.
- Si el token expira o es inválido, `apiFetch` limpia la sesión y redirige
  solo al `index.html` (login).
- Las páginas protegidas empiezan con `Session.requireAuth()` para mandar de
  vuelta al login a quien no tenga sesión.

## Notificaciones de recordatorios (en el navegador)
 
`js/notifications.js` se incluye en todas las páginas autenticadas. Cada
minuto revisa `GET /reminders/me`; si algún recordatorio **activo**
coincide con la hora actual, muestra una notificación del navegador
(`Notification` API) o, si el usuario no dio permiso, un toast dentro de la
página.
 
- Solo funciona **mientras el navegador está abierto** (no es push real en
  segundo plano; eso requeriría un Service Worker + servidor push, o el
  envío de correos desde el backend).
- Al cargar cualquier página se muestra un banner para activar el permiso
  si aún no se ha concedido ni denegado.
- Cada recordatorio solo notifica una vez por minuto/día (se guarda un
  registro en `sessionStorage` para no repetir el aviso en cada chequeo).

## Páginas construidas hasta ahora

- [x] `index.html` — Login con Google.
- [x] `dashboard.html` — Resumen de hoy + promedios semanales (RF_09).
- [x] `habits.html` — Registrar/editar hábitos del día (RF_07/RF_08), con sliders y selector de estado de ánimo (RNF_09).
- [x] `history.html` — Histórico por rango de fechas, con atajos de 7/30 días y edición directa de un día pasado (RF_08).
- [x] `reports.html` — Genera/actualiza el reporte de una semana y grafica la evolución con Chart.js (RF_11).
- [x] `reminders.html` — CRUD completo de recordatorios, con switch de activo/inactivo (RF_12).
- [x] `resources.html` — Recursos de apoyo en tarjetas; lectura para todos, alta/edición/borrado solo para admin (RF_16).
- [x] `feedback.html` — Enviar retroalimentación (máx. 1 por día, categoría + mensaje), ver tu propio historial, y vista de administrador con toda la retroalimentación de todos los usuarios (RF_18).
- [x] `profile.html` — Completar/editar tu perfil: carrera, créditos, meta, correo alternativo, nivel de estrés (RF_03/RF_15).
- [x] `admin_users.html` — Gestión de perfiles de estudiantes: activar/desactivar, editar, eliminar (RF_17). Solo accesible para administradores (redirige a `dashboard.html` si no lo eres).

## Roadmap completo 🎉

Con esto todas las páginas del análisis MoSCoW (Must have + Should have) están construidas. Ideas para seguir puliendo:
 
- Exportar reportes en PDF (RF_13, Could have).
- Reemplazar el `alert("¿Eliminar...?")`/`confirm()` nativos por modales de Bootstrap para una UX más consistente.
- Paginación en `admin_users.html` y `feedback.html` (todas) si la cantidad de datos crece mucho.

El sidebar de `dashboard.html` ya tiene los enlaces a todas estas páginas
listos; solo falta crear cada archivo.
# Persona 3 — Módulo Resources (Recursos)

## Backend
- `backend/resources/models.py` — Modelos `Resource` y `ResourceCategory`
- `backend/resources/views.py` — Listado, detalle y subida de recursos
- `backend/resources/forms.py` — Formulario de subida de recursos
- `backend/resources/urls.py` — Rutas de la app
- `backend/resources/admin.py` — Configuración del panel de administración
- `backend/resources/apps.py`, `backend/resources/0001_initial.py`, `backend/resources/migrations/`

## Frontend
- `frontend/templates/resources/resource_list.html`
  *(no existen aún plantillas de detalle ni de subida — habría que crearlas, ya que `views.py` referencia `resource_detail` y `resource_upload`)*

## Notas
Este módulo maneja archivos subidos (`FileField`, `ImageField`), por lo que depende de `MEDIA_URL`/`MEDIA_ROOT` definidos en `biUNestar/settings.py` (Persona 4).
