# Epic Scent Club Parfum — Sistema de Gestión

App de gestión premium para tu negocio de perfumes. Control total de inventario, clientes, ventas, seguimiento WhatsApp y finanzas, todo desde el navegador con datos persistentes en LocalStorage.

## Stack

- **React 18** + **Vite 5** — SPA ultrarrápida
- **Tailwind CSS 3** — Diseño oscuro/dorado premium
- **LocalStorage** — Persistencia sin backend, funciona offline
- **Vercel** + **Railway** — Deploy en producción

---

## Instalación y desarrollo local

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Build para producción

```bash
npm run build
npm run preview   # preview local del build
```

---

## Deploy en Vercel (recomendado)

1. Conectá el repositorio en [vercel.com](https://vercel.com) → **New Project**.
2. Vercel detecta Vite automáticamente → **Deploy**.
3. La app queda online en `https://tu-proyecto.vercel.app`.

O desde CLI:

```bash
vercel --prod
```

## Deploy en Railway

1. Conectá el repo de GitHub en [railway.app](https://railway.app).
2. Railway usa `railway.toml`: build con `npm run build`, serve con `npm start`.
3. Generá un dominio público desde el panel del servicio.

---

## Respaldo de datos

Los datos viven en el navegador (LocalStorage). Usá el botón **Respaldo** (ícono de base de datos) en el header para:

- **Exportar** un archivo JSON con inventario, clientes, ventas y seguimientos
- **Importar** un respaldo previo para restaurar o migrar entre dispositivos

---

## Estructura del proyecto

```
epic-scent-club/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Inventario.jsx
│   │   ├── Clientes.jsx
│   │   ├── Ventas.jsx
│   │   ├── Seguimiento.jsx
│   │   └── DataBackup.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/workflows/ci.yml
├── railway.toml
├── vercel.json
└── package.json
```

---

## Módulos

### Dashboard
Capital invertido, ventas totales, ganancia neta, cuentas por cobrar, actividad reciente y alertas de stock.

### Inventario
Alta manual, carga masiva (CSV/txt), alertas de stock bajo, edición y eliminación.

### Clientes
CRM con historial de compras, estado de cuenta y toggle de pago.

### Ventas
Registro rápido, descuento automático de stock, filtros por estado.

### Seguimiento WhatsApp
Plantillas de mensajes, recordatorios, prioridades y envío directo por WhatsApp.

---

## Formato de carga masiva

```
Nombre, Stock, CostoBase, Comision, %Ganancia
Sauvage Dior 100ml, 5, 12000, 500, 30
Bleu de Chanel 50ml, 3, 9500, 400, 25
```
