# Epic Scent Club Parfum

Sistema de gestión premium para perfumes con **PWA**, frontend en Vercel y **backend de clientes en Railway + PostgreSQL**.

## Arquitectura

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| Frontend (PWA) | React + Vite + vite-plugin-pwa | Vercel |
| API Clientes | Express + PostgreSQL | Railway |
| Inventario, ventas, seguimiento | LocalStorage | Navegador |

## Desarrollo local

```bash
npm install

# Terminal 1 — API (requiere DATABASE_URL)
cp .env.example .env
npm run dev:api

# Terminal 2 — Frontend
VITE_API_URL=http://localhost:3001 npm run dev
```

## Variables de entorno

### Frontend (Vercel)
```
VITE_API_URL=https://tu-api.up.railway.app
```

### Backend (Railway)
```
DATABASE_URL=postgresql://...
CORS_ORIGINS=http://localhost:5173,https://epic-scent-club.vercel.app
PORT=3001
```

## API — Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| POST | `/api/clientes/bulk` | Importar en lote |
| PUT | `/api/clientes/:id` | Actualizar |
| DELETE | `/api/clientes/:id` | Eliminar |

## PWA

La app es instalable en móvil y desktop. Incluye service worker para cachear assets estáticos y funcionar offline (excepto operaciones de clientes que requieren API).

## Deploy

- **Vercel**: importar repo, setear `VITE_API_URL`, deploy automático
- **Railway**: conectar repo, agregar Postgres, setear `DATABASE_URL` y `CORS_ORIGINS`, start: `npm start`

## Migración automática

Al primer acceso, si hay clientes en LocalStorage y la API está vacía, se migran automáticamente a Railway.
