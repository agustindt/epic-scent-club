import React, { useState } from 'react'
import { Plus, X, Check, ShoppingBag, AlertTriangle, Trash2, Filter } from 'lucide-react'
import { formatCurrency, formatDate, calcPrecioVenta, calcGananciaNeta } from '../utils/helpers'
import { SyncStatus, LoadingCard, ErrorBanner } from './SyncStatus'

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Mercado Pago', 'Otro']

function VentaForm({ perfumes, clientes, onSave, onCancel }) {
  const [form, setForm] = useState({
    perfumeId: '',
    clienteId: '',
    metodoPago: 'Efectivo',
    estadoPago: 'pagado',
    nota: '',
  })

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const selectedPerfume = perfumes.find(p => p.id === form.perfumeId)
  const precioVenta = selectedPerfume
    ? calcPrecioVenta(selectedPerfume.costoBase, selectedPerfume.comision, selectedPerfume.porcentajeGanancia)
    : 0
  const gananciaNeta = selectedPerfume
    ? calcGananciaNeta(selectedPerfume.costoBase, selectedPerfume.comision, selectedPerfume.porcentajeGanancia)
    : 0

  const disponibles = perfumes.filter(p => p.stock > 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.perfumeId || !form.clienteId) return

    const cliente = clientes.find(c => c.id === form.clienteId)
    const perfume = perfumes.find(p => p.id === form.perfumeId)

    onSave({
      perfumeId: perfume.id,
      perfumeNombre: perfume.nombre,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      metodoPago: form.metodoPago,
      estadoPago: form.estadoPago,
      precioVenta,
      gananciaNeta,
      costoBase: perfume.costoBase,
      comision: perfume.comision,
      nota: form.nota.trim(),
      fecha: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-xl font-light text-obsidian-100">Registrar Venta</h3>

      {disponibles.length === 0 && (
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
          <AlertTriangle size={15} /> No hay perfumes con stock disponible.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Perfume *</label>
          <select
            className="input-field"
            value={form.perfumeId}
            onChange={e => set('perfumeId', e.target.value)}
            required
          >
            <option value="">Seleccioná un perfume…</option>
            {disponibles.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.stock} ud.)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Cliente *</label>
          <select
            className="input-field"
            value={form.clienteId}
            onChange={e => set('clienteId', e.target.value)}
            required
          >
            <option value="">Seleccioná un cliente…</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Método de Pago</label>
          <select className="input-field" value={form.metodoPago} onChange={e => set('metodoPago', e.target.value)}>
            {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Estado del Pago</label>
          <div className="flex gap-2 mt-1">
            {['pagado', 'pendiente'].map(estado => (
              <button
                key={estado}
                type="button"
                onClick={() => set('estadoPago', estado)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 border
                  ${form.estadoPago === estado
                    ? estado === 'pagado'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400'
                      : 'bg-amber-950/50 border-amber-800 text-amber-400'
                    : 'bg-obsidian-800 border-obsidian-600 text-obsidian-400 hover:border-obsidian-500'
                  }`}
              >
                {estado === 'pagado' ? '✓ Pagado' : '⏳ Cuenta Corriente'}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Nota (opcional)</label>
          <input className="input-field" placeholder="Ej: paga la semana que viene…" value={form.nota} onChange={e => set('nota', e.target.value)} />
        </div>
      </div>

      {selectedPerfume && (
        <div className="bg-obsidian-800 rounded-xl p-4 grid grid-cols-3 gap-4 border border-obsidian-700">
          <div>
            <p className="text-xs text-obsidian-500 mb-0.5">Precio de Venta</p>
            <p className="text-lg font-display font-light text-gold-400">{formatCurrency(precioVenta)}</p>
          </div>
          <div>
            <p className="text-xs text-obsidian-500 mb-0.5">Ganancia Neta</p>
            <p className="text-lg font-display font-light text-emerald-400">{formatCurrency(gananciaNeta)}</p>
          </div>
          <div>
            <p className="text-xs text-obsidian-500 mb-0.5">Stock restante</p>
            <p className={`text-lg font-display font-light ${selectedPerfume.stock - 1 < 2 ? 'text-red-400' : 'text-obsidian-200'}`}>
              {selectedPerfume.stock - 1} ud.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-gold flex items-center gap-2" disabled={disponibles.length === 0}>
          <Check size={15} /> Confirmar Venta
        </button>
        <button type="button" className="btn-ghost flex items-center gap-2" onClick={onCancel}>
          <X size={15} /> Cancelar
        </button>
      </div>
    </form>
  )
}

export default function Ventas({
  ventas, loading, error, syncing, reload,
  removeVenta, togglePago,
  perfumes, clientes, onVenta,
}) {
  const [showForm, setShowForm] = useState(false)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  const handleVenta = async (data) => {
    setSaving(true)
    setActionError(null)
    try {
      await onVenta(data)
      setShowForm(false)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVenta = async (id) => {
    if (!confirm('¿Eliminar esta venta? El stock NO se restaurará automáticamente.')) return
    setSaving(true)
    setActionError(null)
    try {
      await removeVenta(id)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePago = async (id) => {
    setActionError(null)
    try {
      await togglePago(id)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const filtered = ventas
    .filter(v => {
      if (filterEstado === 'pagado') return v.estadoPago === 'pagado'
      if (filterEstado === 'pendiente') return v.estadoPago === 'pendiente'
      return true
    })
    .filter(v =>
      v.perfumeNombre.toLowerCase().includes(search.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="section-title">Ventas</h2>
            {!loading && <SyncStatus error={error} syncing={syncing} />}
          </div>
          <p className="text-sm text-obsidian-500 mt-0.5">
            {loading ? 'Cargando…' : (
              <>
                {ventas.length} transacción{ventas.length !== 1 ? 'es' : ''} ·{' '}
                {ventas.filter(v => v.estadoPago === 'pendiente').length} pendiente{ventas.filter(v => v.estadoPago === 'pendiente').length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setShowForm(v => !v)} disabled={loading}>
          <Plus size={15} /> Nueva Venta
        </button>
      </div>

      <ErrorBanner message={actionError || error} onRetry={error ? reload : null} />

      {showForm && (
        <div className="card p-5 fade-up">
          <VentaForm
            perfumes={perfumes}
            clientes={clientes}
            onSave={handleVenta}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filters */}
      {ventas.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field max-w-xs"
            placeholder="Buscar por perfume o cliente…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {['todos', 'pagado', 'pendiente'].map(f => (
              <button
                key={f}
                onClick={() => setFilterEstado(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border
                  ${filterEstado === f
                    ? 'bg-gold-600/20 border-gold-700/50 text-gold-400'
                    : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600 hover:text-obsidian-300'
                  }`}
              >
                {f === 'todos' ? 'Todos' : f === 'pagado' ? 'Pagados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <LoadingCard />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag size={40} className="mx-auto mb-4 text-obsidian-700" />
          <p className="text-obsidian-400 font-display text-xl font-light">
            {ventas.length === 0 ? 'Sin ventas registradas' : 'Sin resultados'}
          </p>
          <p className="text-obsidian-600 text-sm mt-2">
            {ventas.length === 0
              ? 'Registrá tu primera venta para empezar a trackear.'
              : 'Probá con otro filtro o término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(v => (
            <div key={v.id} className={`card-hover p-4 flex items-center gap-4 ${v.estadoPago === 'pendiente' ? 'border-amber-800/40' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-medium text-obsidian-100">{v.perfumeNombre}</span>
                  <span className="text-xs text-obsidian-600">→</span>
                  <span className="text-sm text-obsidian-300">{v.clienteNombre}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-obsidian-500">{formatDate(v.fecha)}</span>
                  <span className="text-xs text-obsidian-600">·</span>
                  <span className="text-xs text-obsidian-500">{v.metodoPago}</span>
                  {v.nota && (
                    <>
                      <span className="text-xs text-obsidian-600">·</span>
                      <span className="text-xs text-obsidian-500 italic">"{v.nota}"</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gold-400">{formatCurrency(v.precioVenta)}</p>
                <p className="text-xs text-obsidian-500">+{formatCurrency(v.gananciaNeta)} ganancia</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleTogglePago(v.id)}
                  className={v.estadoPago === 'pagado' ? 'badge-paid cursor-pointer hover:opacity-80' : 'badge-pending cursor-pointer hover:opacity-80'}
                  title="Click para cambiar estado"
                >
                  {v.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                </button>
                <button className="btn-danger p-1.5" onClick={() => handleDeleteVenta(v.id)} title="Eliminar venta">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
