# biUNestar - Frontend

Frontend estático (HTML + CSS + JS plano, sin frameworks ni build tools) para
consumir la API de [biUNestar backend](../basefastapi) (FastAPI). Vive en su
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

## Páginas construidas hasta ahora

- [x] `index.html` — Login con Google.
- [x] `dashboard.html` — Resumen de hoy + promedios semanales (RF_09).
- [x] `habits.html` — Registrar/editar hábitos del día (RF_07/RF_08), con sliders y selector de estado de ánimo (RNF_09).
- [x] `history.html` — Histórico semanal/mensual (RF_08).
- [x] `reports.html` — Reportes con gráficas (RF_11).
- [x] `reminders.html` — CRUD de recordatorios (RF_12).

## Próximas páginas (pendientes)

- [ ] `resources.html` — Recursos de apoyo, lectura para todos / CRUD para admin (RF_16).
- [ ] `feedback.html` — Enviar retroalimentación / verla como admin (RF_18).
- [ ] `profile.html` — Completar/editar perfil (RF_03/RF_15).
- [ ] `admin_users.html` — Gestión de perfiles de estudiantes, solo admin (RF_17).

El sidebar de `dashboard.html` ya tiene los enlaces a todas estas páginas
listos; solo falta crear cada archivo.
