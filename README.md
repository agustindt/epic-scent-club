# Epic Scent Club Parfum

Sistema de gestión premium para perfumes con **PWA**, frontend en Vercel y **backend completo en Railway + PostgreSQL**.

## Arquitectura

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| Frontend (PWA) | React + Vite + vite-plugin-pwa | Vercel |
| API | Express + PostgreSQL | Railway |

Todos los módulos (clientes, inventario, ventas, seguimiento) persisten en PostgreSQL y sincronizan automáticamente entre dispositivos.

## API

| Módulo | Rutas |
|--------|-------|
| Clientes | `/api/clientes` |
| Inventario | `/api/perfumes` |
| Ventas | `/api/ventas` |
| Seguimiento | `/api/seguimientos` |
| Health | `/api/health` |

Cada módulo soporta `GET`, `POST`, `PUT/:id`, `DELETE/:id` y `POST /bulk` para importación.

## Desarrollo local

```bash
npm install
railway run npm run dev:api    # Terminal 1
VITE_API_URL=http://localhost:3001 npm run dev  # Terminal 2
```

## Deploy

- **Vercel**: `VITE_API_URL=https://tu-api.up.railway.app`
- **Railway**: Postgres + `DATABASE_URL` + `CORS_ORIGINS` + `npm start`

## Migración automática

Al primer acceso, los datos en LocalStorage se migran automáticamente a Railway si la API está vacía.
