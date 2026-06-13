# TDEFA Digital (Frontend)

Frontend React conectado a la API Node + MySQL real de TDEFA.

## Stack

- React + TypeScript + Vite
- React Router
- TailwindCSS v4 + shadcn/ui
- Zustand (estado global simple)
- React Hook Form + Zod (formularios)
- Lucide Icons
- Framer Motion (microinteracciones)

## Scripts

```bash
npm install
npm run dev
```

`npm run dev` levanta:

- frontend Vite en `http://localhost:5173`
- API local en `http://localhost:3001/api`

Importante:

- el frontend local y el frontend desplegado deben consultar siempre la API real
- la fuente de verdad es MySQL a traves del backend, no mocks del frontend
- el login tambien pasa por `/api/auth/login`

## Usar Hostinger

Si quieres que el frontend apunte al backend desplegado en Hostinger en lugar de `localhost`, crea `frontend/.env.local` con:

```bash
VITE_API_URL=https://lightseagreen-baboon-179690.hostingersite.com/api
```

Tambien puedes copiar `frontend/.env.hostinger.example`.

Importante:

- esto solo funciona si la API remota responde correctamente
- la API remota debe estar conectada a la base MySQL real del backend

Configuracion MySQL por defecto:

- base: `planilleros-app`
- usuario: `root`
- password: vacio
- host: `127.0.0.1`
- puerto: `3306`

Build:

```bash
npm run build
npm run preview
```

Seed de partidos y planillas:

```bash
npm run seed:matches
```

Pruebas:

```bash
npm test
```

Incluye:

- unitarias sobre mapeo y configuracion de base
- integracion API + MySQL real
- smoke test full-stack con frontend compilado + API

## Credenciales demo

- Planillero: `planillero` / `planillero`
- Administrador: `admin` / `admin`

La API crea la base y las tablas si no existen, y sincroniza datos semilla para partidos, planillas, planilleros y credenciales demo.
