# TDEFA Planilleros

Repositorio unificado con:

- `frontend/`: aplicacion Vite del panel administrativo y la planilla.
- `backend/`: API Node.js + MySQL.
- `app.js`: entrypoint raiz de compatibilidad para despliegue en Hostinger apuntando al backend.
- `index.js`: entrypoint raiz recomendado para despliegues que arrancan `index.js`.

## Hostinger

El deploy Node.js de Hostinger puede seguir usando:

- Root directory: `./`
- Entry file: `index.js` o `app.js`

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

La regla operativa es simple: tanto el frontend local como el de produccion deben consultar siempre la API real del backend, que a su vez usa la base MySQL real configurada en ese entorno.
