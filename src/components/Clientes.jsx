import React, { useState } from 'react'
import { Plus, X, Check, Trash2, User, Phone, ShoppingBag, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'
import { generateId, formatCurrency, formatDate } from '../utils/helpers'

const EMPTY_FORM = { nombre: '', telefono: '' }

function ClienteForm({ initial = EMPTY_FORM, onSave, onCancel, title = 'Nuevo Cliente' }) {
  const [form, setForm] = useState(initial)
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); if (form.nombre.trim()) onSave({ nombre: form.nombre.trim(), telefono: form.telefono.trim() }) }} className="space-y-4">
      <h3 className="font-display text-xl font-light text-obsidian-100">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre *</label>
          <input className="input-field" placeholder="Nombre completo" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input-field" placeholder="+54 9 351 000-0000" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-gold flex items-center gap-2"><Check size={15} /> Guardar</button>
        {onCancel && <button type="button" className="btn-ghost flex items-center gap-2" onClick={onCancel}><X size={15} /> Cancelar</button>}
      </div>
    </form>
  )
}

function ClienteCard({ cliente, ventas, onEdit, onDelete, onTogglePago }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  const clienteVentas = ventas.filter(v => v.clienteId === cliente.id)
  const pendientes = clienteVentas.filter(v => v.estadoPago === 'pendiente')
  const totalComprado = clienteVentas.reduce((a, v) => a + v.precioVenta, 0)
  const totalPendiente = pendientes.reduce((a, v) => a + v.precioVenta, 0)

  if (editing) {
    return (
      <div className="card p-5 fade-up">
        <ClienteForm
          title="Editar Cliente"
          initial={{ nombre: cliente.nombre, telefono: cliente.telefono || '' }}
          onSave={(data) => { onEdit(cliente.id, data); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={`card-hover overflow-hidden ${pendientes.length > 0 ? 'border-amber-800/50' : ''}`}>
      <div className="p-4 flex items-center gap-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-sm font-semibold text-gold-500 flex-shrink-0">
          {cliente.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-obsidian-100">{cliente.nombre}</span>
            {pendientes.length > 0 && (
              <span className="badge-pending"><span>{pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}</span></span>
            )}
          </div>
          {cliente.telefono && (
            <span className="text-xs text-obsidian-500">{cliente.telefono}</span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-obsidian-200">{clienteVentas.length} compra{clienteVentas.length !== 1 ? 's' : ''}</p>
          {totalPendiente > 0 && <p className="text-xs text-amber-400">Debe {formatCurrency(totalPendiente)}</p>}
        </div>
        <div className="text-obsidian-500 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-obsidian-800 px-4 py-3 bg-obsidian-950/30 fade-up">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Total comprado</p>
              <p className="text-sm font-semibold text-obsidian-100">{formatCurrency(totalComprado)}</p>
            </div>
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Pendiente</p>
              <p className={`text-sm font-semibold ${totalPendiente > 0 ? 'text-amber-400' : 'text-obsidian-500'}`}>
                {formatCurrency(totalPendiente)}
              </p>
            </div>
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Transacciones</p>
              <p className="text-sm font-semibold text-obsidian-100">{clienteVentas.length}</p>
            </div>
          </div>

          {/* Historial */}
          {clienteVentas.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-obsidian-500 uppercase tracking-wider mb-2">Historial</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {[...clienteVentas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(v => (
                  <div key={v.id} className="flex items-center justify-between py-1.5 border-b border-obsidian-800/60 last:border-0">
                    <div>
                      <p className="text-xs text-obsidian-200">{v.perfumeNombre}</p>
                      <p className="text-xs text-obsidian-500">{formatDate(v.fecha)} · {v.metodoPago}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-obsidian-200">{formatCurrency(v.precioVenta)}</span>
                      <button
                        className={v.estadoPago === 'pagado' ? 'badge-paid cursor-pointer hover:opacity-80' : 'badge-pending cursor-pointer hover:opacity-80'}
                        onClick={(e) => { e.stopPropagation(); onTogglePago(v.id) }}
                        title="Click para cambiar estado"
                      >
                        {v.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn-ghost flex items-center gap-1.5 text-xs py-1.5" onClick={e => { e.stopPropagation(); setEditing(true) }}>
              <Edit3 size={12} /> Editar
            </button>
            <button className="btn-danger flex items-center gap-1.5" onClick={e => { e.stopPropagation(); onDelete(cliente.id) }}>
              <Trash2 size={12} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Clientes({ clientes, setClientes, ventas, setVentas }) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const handleAdd = (data) => {
    setClientes(prev => [...prev, { id: generateId(), ...data }])
    setShowForm(false)
  }

  const handleEdit = (id, data) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este cliente? Sus ventas se conservarán.')) {
      setClientes(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleTogglePago = (ventaId) => {
    setVentas(prev => prev.map(v =>
      v.id === ventaId
        ? { ...v, estadoPago: v.estadoPago === 'pagado' ? 'pendiente' : 'pagado' }
        : v
    ))
  }

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono || '').includes(search)
  )

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="section-title">Clientes</h2>
          <p className="text-sm text-obsidian-500 mt-0.5">{clientes.length} registrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setShowForm(v => !v)}>
          <Plus size={15} /> Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="card p-5 fade-up">
          <ClienteForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {clientes.length > 0 && (
        <input
          className="input-field max-w-sm"
          placeholder="Buscar cliente…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <User size={40} className="mx-auto mb-4 text-obsidian-700" />
          <p className="text-obsidian-400 font-display text-xl font-light">
            {clientes.length === 0 ? 'Sin clientes registrados' : 'Sin resultados'}
          </p>
          <p className="text-obsidian-600 text-sm mt-2">
            {clientes.length === 0 ? 'Agregá tu primer cliente para comenzar.' : 'Probá con otro nombre o teléfono.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <ClienteCard
              key={c.id}
              cliente={c}
              ventas={ventas}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePago={handleTogglePago}
            />
          ))}
        </div>
      )}
    </div>
  )
}
