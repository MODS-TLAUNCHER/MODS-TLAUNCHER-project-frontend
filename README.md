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
