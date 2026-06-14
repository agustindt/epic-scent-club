import React from 'react'
import { TrendingUp, Package, DollarSign, AlertTriangle, ShoppingBag, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/helpers'

function MetricCard({ icon: Icon, label, value, sub, color = 'gold', alert = false }) {
  const colorMap = {
    gold:    'text-gold-400',
    emerald: 'text-emerald-400',
    amber:   'text-amber-400',
    red:     'text-red-400',
    blue:    'text-blue-400',
  }
  return (
    <div className={`metric-card fade-up ${alert ? 'border-amber-800/60' : ''}`}>
      <div className="flex items-start justify-between">
        <span className="label">{label}</span>
        <div className={`p-2 rounded-lg bg-obsidian-800 ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className={`text-2xl font-semibold font-display tracking-wide ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-obsidian-500">{sub}</p>}
    </div>
  )
}

export default function Dashboard({ perfumes, ventas, clientes }) {
  // Capital invertido: suma del costo base * stock actual
  const capitalInvertido = perfumes.reduce((acc, p) => acc + (p.costoBase * p.stock), 0)

  // Ventas totales (precio de venta de las ventas concretadas)
  const ventasTotales = ventas.reduce((acc, v) => acc + v.precioVenta, 0)

  // Ganancia neta total
  const gananciaNeta = ventas.reduce((acc, v) => acc + v.gananciaNeta, 0)

  // Cuentas por cobrar (ventas pendientes)
  const cuentasPorCobrar = ventas
    .filter(v => v.estadoPago === 'pendiente')
    .reduce((acc, v) => acc + v.precioVenta, 0)

  const ventasPendientes = ventas.filter(v => v.estadoPago === 'pendiente').length

  // Perfumes con bajo stock
  const bajosStock = perfumes.filter(p => p.stock > 0 && p.stock < 2)

  // Ventas recientes
  const ventasRecientes = [...ventas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  return (
    <div className="space-y-8 fade-up">
      {/* Hero metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Package}
          label="Capital Invertido"
          value={formatCurrency(capitalInvertido)}
          sub={`${perfumes.reduce((a, p) => a + p.stock, 0)} unidades en stock`}
          color="blue"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Ventas Totales"
          value={formatCurrency(ventasTotales)}
          sub={`${ventas.length} transacciones`}
          color="emerald"
        />
        <MetricCard
          icon={TrendingUp}
          label="Ganancia Neta"
          value={formatCurrency(gananciaNeta)}
          sub="Margen real generado"
          color="gold"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Cuentas por Cobrar"
          value={formatCurrency(cuentasPorCobrar)}
          sub={`${ventasPendientes} venta${ventasPendientes !== 1 ? 's' : ''} pendiente${ventasPendientes !== 1 ? 's' : ''}`}
          color={cuentasPorCobrar > 0 ? 'amber' : 'emerald'}
          alert={cuentasPorCobrar > 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ventas recientes */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-light text-obsidian-100">Actividad Reciente</h3>
            <span className="text-xs text-obsidian-500">Últimas 5 ventas</span>
          </div>
          {ventasRecientes.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag size={32} className="mx-auto mb-3 text-obsidian-700" />
              <p className="text-obsidian-500 text-sm">Aún no hay ventas registradas.</p>
              <p className="text-obsidian-600 text-xs mt-1">Las transacciones aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ventasRecientes.map(v => (
                <div key={v.id} className="flex items-center justify-between py-2.5 border-b border-obsidian-800 last:border-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-obsidian-100 font-medium">{v.perfumeNombre}</span>
                    <span className="text-xs text-obsidian-500">{v.clienteNombre} · {formatDate(v.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gold-400">{formatCurrency(v.precioVenta)}</span>
                    <span className={v.estadoPago === 'pagado' ? 'badge-paid' : 'badge-pending'}>
                      {v.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas panel */}
        <div className="space-y-4">
          {/* Bajo stock */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-red-400" />
              <h3 className="text-sm font-medium text-obsidian-200">Stock Crítico</h3>
            </div>
            {bajosStock.length === 0 ? (
              <p className="text-xs text-obsidian-500">Sin alertas de stock.</p>
            ) : (
              <div className="space-y-2">
                {bajosStock.map(p => (
                  <div key={p.id} className="flex justify-between items-center">
                    <span className="text-xs text-obsidian-300 truncate">{p.nombre}</span>
                    <span className="badge-low-stock">{p.stock} ud.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagos pendientes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={15} className="text-amber-400" />
              <h3 className="text-sm font-medium text-obsidian-200">Pagos Pendientes</h3>
            </div>
            {ventasPendientes === 0 ? (
              <p className="text-xs text-obsidian-500">Sin deudas pendientes.</p>
            ) : (
              <div className="space-y-2">
                {ventas.filter(v => v.estadoPago === 'pendiente').slice(0, 4).map(v => (
                  <div key={v.id} className="flex justify-between items-center">
                    <span className="text-xs text-obsidian-300 truncate">{v.clienteNombre}</span>
                    <span className="text-xs font-semibold text-amber-400">{formatCurrency(v.precioVenta)}</span>
                  </div>
                ))}
                {ventasPendientes > 4 && (
                  <p className="text-xs text-obsidian-500">+{ventasPendientes - 4} más…</p>
                )}
              </div>
            )}
          </div>

          {/* Resumen clientes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-blue-400" />
              <h3 className="text-sm font-medium text-obsidian-200">Clientes</h3>
            </div>
            <p className="text-2xl font-display font-light text-blue-400">{clientes.length}</p>
            <p className="text-xs text-obsidian-500 mt-1">registrados</p>
          </div>
        </div>
      </div>
    </div>
  )
}
