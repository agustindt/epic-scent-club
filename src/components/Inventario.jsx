import React, { useState, useRef } from 'react'
import {
  Plus, Upload, AlertTriangle, Trash2, Edit3, X, Check,
  ChevronDown, ChevronUp, FileText, Package
} from 'lucide-react'
import { calcPrecioVenta, calcGananciaNeta, formatCurrency, parseBulkText } from '../utils/helpers'
import { bulkCreatePerfumes } from '../api/perfumes'
import { SyncStatus, LoadingCard, ErrorBanner } from './SyncStatus'

const EMPTY_FORM = {
  nombre: '', stock: '', costoBase: '', comision: '', porcentajeGanancia: '', imagen: '',
}

function PerfumeForm({ initial = EMPTY_FORM, onSave, onCancel, title = 'Nuevo Perfume' }) {
  const [form, setForm] = useState(initial)

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const precioVenta = calcPrecioVenta(form.costoBase, form.comision, form.porcentajeGanancia)
  const gananciaNeta = calcGananciaNeta(form.costoBase, form.comision, form.porcentajeGanancia)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    onSave({
      nombre: form.nombre.trim(),
      stock: parseInt(form.stock) || 0,
      costoBase: parseFloat(form.costoBase) || 0,
      comision: parseFloat(form.comision) || 0,
      porcentajeGanancia: parseFloat(form.porcentajeGanancia) || 0,
      imagen: form.imagen.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-xl font-light text-obsidian-100">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Nombre del Perfume / Marca *</label>
          <input
            className="input-field"
            placeholder="Ej: Sauvage Dior 100ml"
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Stock Inicial (unidades) *</label>
          <input
            className="input-field"
            type="number" min="0" placeholder="0"
            value={form.stock}
            onChange={e => set('stock', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Costo Base ($) *</label>
          <input
            className="input-field"
            type="number" min="0" step="0.01" placeholder="0.00"
            value={form.costoBase}
            onChange={e => set('costoBase', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Comisión de Venta ($)</label>
          <input
            className="input-field"
            type="number" min="0" step="0.01" placeholder="0.00"
            value={form.comision}
            onChange={e => set('comision', e.target.value)}
          />
        </div>

        <div>
          <label className="label">% de Ganancia Deseada</label>
          <input
            className="input-field"
            type="number" min="0" step="0.01" placeholder="0"
            value={form.porcentajeGanancia}
            onChange={e => set('porcentajeGanancia', e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">URL de imagen (opcional, para catálogo público)</label>
          <input
            className="input-field"
            type="url"
            placeholder="https://ejemplo.com/foto.jpg"
            value={form.imagen}
            onChange={e => set('imagen', e.target.value)}
          />
        </div>
      </div>

      {/* Calculated preview */}
      {(form.costoBase || form.comision || form.porcentajeGanancia) && (
        <div className="bg-obsidian-800 rounded-xl p-4 grid grid-cols-2 gap-4 border border-obsidian-700">
          <div>
            <p className="text-xs text-obsidian-500 uppercase tracking-wider mb-1">Precio de Venta</p>
            <p className="text-xl font-display font-light text-gold-400">{formatCurrency(precioVenta)}</p>
          </div>
          <div>
            <p className="text-xs text-obsidian-500 uppercase tracking-wider mb-1">Ganancia Neta / ud.</p>
            <p className={`text-xl font-display font-light ${gananciaNeta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(gananciaNeta)}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-gold flex items-center gap-2">
          <Check size={15} /> Guardar
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost flex items-center gap-2" onClick={onCancel}>
            <X size={15} /> Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function BulkImport({ onImport, onClose }) {
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState([])
  const fileRef = useRef()

  const parseText = (raw) => {
    const { results, errors } = parseBulkText(raw)
    setPreview(results)
    setErrors(errors)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target.result
      setText(raw)
      parseText(raw)
    }
    reader.readAsText(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target.result
      setText(raw)
      parseText(raw)
    }
    reader.readAsText(file)
  }

  const handleTextChange = (val) => {
    setText(val)
    if (val.trim()) parseText(val)
    else { setPreview(null); setErrors([]) }
  }

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview)
      onClose()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-light text-obsidian-100">Carga Masiva</h3>
        <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-200 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="bg-obsidian-800 rounded-lg p-3 border border-obsidian-700 text-xs text-obsidian-400 space-y-1">
        <p className="font-medium text-obsidian-300">Formato esperado (CSV o texto):</p>
        <p className="font-mono">Nombre, Stock, CostoBase, Comision, %Ganancia</p>
        <p className="font-mono text-obsidian-500">Ej: Sauvage 100ml, 5, 12000, 500, 30</p>
      </div>

      <div
        className={`drop-zone rounded-xl p-8 text-center cursor-pointer ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} className="mx-auto mb-3 text-obsidian-500" />
        <p className="text-sm text-obsidian-400">Arrastrá un archivo .txt o .csv</p>
        <p className="text-xs text-obsidian-600 mt-1">o hacé click para seleccionar</p>
        <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFileInput} />
      </div>

      <div>
        <label className="label">O pegá el texto directamente</label>
        <textarea
          className="input-field resize-none h-28 font-mono text-xs"
          placeholder="Nombre, Stock, CostoBase, Comision, %Ganancia"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={11} /> {e}
            </p>
          ))}
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="card p-3">
          <p className="text-xs font-medium text-emerald-400 mb-2">✓ {preview.length} perfume{preview.length !== 1 ? 's' : ''} listos para importar</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {preview.map((p, i) => (
              <div key={i} className="text-xs text-obsidian-400 flex justify-between">
                <span>{p.nombre}</span>
                <span>{p.stock} ud · {formatCurrency(p.costoBase)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          className="btn-gold flex items-center gap-2"
          onClick={handleImport}
          disabled={!preview || preview.length === 0}
        >
          <Check size={15} /> Importar {preview?.length > 0 ? `(${preview.length})` : ''}
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

function PerfumeRow({ perfume, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  const precioVenta = calcPrecioVenta(perfume.costoBase, perfume.comision, perfume.porcentajeGanancia)
  const gananciaNeta = calcGananciaNeta(perfume.costoBase, perfume.comision, perfume.porcentajeGanancia)
  const lowStock = perfume.stock < 2

  if (editing) {
    return (
      <div className="card p-5 fade-up">
        <PerfumeForm
          initial={{ ...perfume, stock: String(perfume.stock), costoBase: String(perfume.costoBase), comision: String(perfume.comision), porcentajeGanancia: String(perfume.porcentajeGanancia), imagen: perfume.imagen || '' }}
          title="Editar Perfume"
          onSave={(data) => { onEdit(perfume.id, data); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={`card-hover overflow-hidden ${lowStock && perfume.stock > 0 ? 'border-red-900/60' : ''} ${perfume.stock === 0 ? 'opacity-60' : ''}`}>
      <div
        className="p-4 flex items-center gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Stock bubble */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          ${perfume.stock === 0 ? 'bg-obsidian-800 text-obsidian-500' : lowStock ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-obsidian-800 text-obsidian-200'}`}>
          {perfume.stock}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-obsidian-100 truncate">{perfume.nombre}</span>
            {lowStock && perfume.stock > 0 && <span className="badge-low-stock flex-shrink-0"><AlertTriangle size={10} /> Stock bajo</span>}
            {perfume.stock === 0 && <span className="text-xs text-obsidian-500">Sin stock</span>}
          </div>
          <span className="text-xs text-obsidian-500">Costo: {formatCurrency(perfume.costoBase)}</span>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-gold-400">{formatCurrency(precioVenta)}</p>
          <p className="text-xs text-obsidian-500">precio venta</p>
        </div>

        <div className="text-obsidian-500 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-obsidian-800 px-4 py-3 bg-obsidian-950/30 fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Costo Base</p>
              <p className="text-sm font-medium text-obsidian-200">{formatCurrency(perfume.costoBase)}</p>
            </div>
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Comisión</p>
              <p className="text-sm font-medium text-obsidian-200">{formatCurrency(perfume.comision)}</p>
            </div>
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">% Ganancia</p>
              <p className="text-sm font-medium text-obsidian-200">{perfume.porcentajeGanancia}%</p>
            </div>
            <div>
              <p className="text-xs text-obsidian-500 mb-0.5">Ganancia Neta / ud.</p>
              <p className={`text-sm font-semibold ${gananciaNeta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(gananciaNeta)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex items-center gap-1.5 text-xs py-1.5" onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
              <Edit3 size={12} /> Editar
            </button>
            <button className="btn-danger flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); onDelete(perfume.id) }}>
              <Trash2 size={12} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Inventario({
  perfumes, loading, error, syncing, reload,
  addPerfume, editPerfume, removePerfume,
}) {
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  const handleAdd = async (data) => {
    setSaving(true)
    setActionError(null)
    try {
      await addPerfume(data)
      setShowForm(false)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (id, data) => {
    setSaving(true)
    setActionError(null)
    try {
      await editPerfume(id, data)
    } catch (err) {
      setActionError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este perfume del inventario?')) return
    setSaving(true)
    setActionError(null)
    try {
      await removePerfume(id)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkImport = async (items) => {
    setSaving(true)
    setActionError(null)
    try {
      await bulkCreatePerfumes(items)
      await reload()
      setShowBulk(false)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = perfumes.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = perfumes.filter(p => p.stock > 0 && p.stock < 2).length

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="section-title">Inventario</h2>
            {!loading && <SyncStatus error={error} syncing={syncing} />}
          </div>
          <p className="text-sm text-obsidian-500 mt-0.5">
            {loading ? 'Cargando…' : (
              <>
                {perfumes.length} perfume{perfumes.length !== 1 ? 's' : ''} ·{' '}
                {perfumes.reduce((a, p) => a + p.stock, 0)} unidades en stock
                {lowStockCount > 0 && (
                  <span className="ml-2 text-red-400">· {lowStockCount} con stock crítico</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {error && (
            <button className="btn-ghost flex items-center gap-2" onClick={reload}>
              Reintentar
            </button>
          )}
          <button className="btn-ghost flex items-center gap-2" onClick={() => { setShowBulk(true); setShowForm(false) }} disabled={loading}>
            <Upload size={15} /> Carga masiva
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => { setShowForm(true); setShowBulk(false) }} disabled={loading}>
            <Plus size={15} /> Agregar
          </button>
        </div>
      </div>

      <ErrorBanner message={actionError || error} onRetry={error ? reload : null} />

      {/* Forms */}
      {showBulk && (
        <div className="card p-5 fade-up">
          <BulkImport onImport={handleBulkImport} onClose={() => setShowBulk(false)} />
        </div>
      )}

      {showForm && !showBulk && (
        <div className="card p-5 fade-up">
          <PerfumeForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Search */}
      {perfumes.length > 0 && (
        <input
          className="input-field max-w-sm"
          placeholder="Buscar perfume…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {/* List */}
      {loading ? (
        <LoadingCard />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={40} className="mx-auto mb-4 text-obsidian-700" />
          <p className="text-obsidian-400 font-display text-xl font-light">
            {perfumes.length === 0 ? 'Sin perfumes en inventario' : 'Sin resultados'}
          </p>
          <p className="text-obsidian-600 text-sm mt-2">
            {perfumes.length === 0 ? 'Agregá tu primer perfume o importá una lista.' : 'Probá con otro término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <PerfumeRow key={p.id} perfume={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
