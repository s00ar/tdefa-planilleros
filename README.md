# TDEFA Planilleros

Repositorio unificado con:

- `frontend/`: aplicacion Vite del panel administrativo y la planilla.
- `backend/`: API Node.js + MySQL.
- `app.js`: entrypoint raiz para despliegue en Hostinger apuntando al backend.

## Hostinger

El deploy Node.js de Hostinger puede seguir usando:

- Root directory: `./`
- Entry file: `app.js`

Variables necesarias en Hostinger:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_AUTO_CREATE=false`
- `DB_SEED=false`

Para el frontend, usar:

- `VITE_API_URL=https://lightseagreen-baboon-179690.hostingersite.com/api`
