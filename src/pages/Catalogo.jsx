import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Search, Sparkles, Package, RefreshCw } from 'lucide-react'
import { fetchPerfumes } from '../api/perfumes'
import { calcPrecioVenta, formatCurrency, buildWhatsAppLink } from '../utils/helpers'

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || ''

function PerfumeImage({ perfume }) {
  const [error, setError] = useState(false)

  if (perfume.imagen && !error) {
    return (
      <img
        src={perfume.imagen}
        alt={perfume.nombre}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-obsidian-800 via-obsidian-900 to-obsidian-950">
      <span className="font-display text-4xl text-gold-500/80 mb-1">
        {perfume.nombre.charAt(0).toUpperCase()}
      </span>
      <Sparkles size={16} className="text-gold-600/40" />
    </div>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return <span className="badge-low-stock">Agotado</span>
  }
  if (stock < 2) {
    return <span className="badge-pending">Últimas {stock} ud.</span>
  }
  return <span className="badge-paid">Disponible</span>
}

function CatalogCard({ perfume }) {
  const precio = calcPrecioVenta(perfume.costoBase, perfume.comision, perfume.porcentajeGanancia)
  const disponible = perfume.stock > 0

  const mensaje = disponible
    ? `Hola! Me interesa *${perfume.nombre}* (${formatCurrency(precio)}). ¿Podés contarme más?`
    : `Hola! Me interesa *${perfume.nombre}*. ¿Cuándo tendrían reposición?`

  const waLink = WHATSAPP ? buildWhatsAppLink(WHATSAPP, mensaje) : null

  return (
    <article className={`card-hover overflow-hidden flex flex-col ${!disponible ? 'opacity-75' : ''}`}>
      <div className="aspect-[4/5] relative overflow-hidden bg-obsidian-900">
        <PerfumeImage perfume={perfume} />
        <div className="absolute top-3 right-3">
          <StockBadge stock={perfume.stock} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display text-lg font-light text-obsidian-100 leading-tight">
            {perfume.nombre}
          </h3>
          <p className="text-xl font-semibold text-gold-400 mt-1">{formatCurrency(precio)}</p>
        </div>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${disponible
                ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/60'
                : 'bg-obsidian-800 border border-obsidian-600 text-obsidian-300 hover:border-gold-700/50 hover:text-gold-400'
              }`}
          >
            <MessageCircle size={15} />
            {disponible ? 'Consultar por WhatsApp' : 'Consultar reposición'}
          </a>
        ) : (
          <p className="text-xs text-obsidian-500 text-center">WhatsApp no configurado</p>
        )}
      </div>
    </article>
  )
}

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'Catálogo · Epic Scent Club Parfum'
    return () => { document.title = 'Epic Scent Club Parfum' }
  }, [])

  const load = () => {
    setLoading(true)
    setError(null)
    fetchPerfumes()
      .then(setPerfumes)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return perfumes
      .filter(p => p.nombre.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.stock > 0 && b.stock === 0) return -1
        if (b.stock > 0 && a.stock === 0) return 1
        return a.nombre.localeCompare(b.nombre)
      })
  }, [perfumes, search])

  const disponibles = perfumes.filter(p => p.stock > 0).length
  const waGeneral = WHATSAPP
    ? buildWhatsAppLink(WHATSAPP, 'Hola! Quiero conocer el catálogo de Epic Scent Club Parfum 🌿')
    : null

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      {/* Hero */}
      <header className="relative border-b border-obsidian-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-900/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-3">Colección exclusiva</p>
              <h1 className="shimmer-gold font-display text-3xl sm:text-4xl font-light tracking-wide">
                Epic Scent Club
              </h1>
              <p className="text-obsidian-400 text-sm mt-2 max-w-md">
                Fragancias premium seleccionadas. Consultá disponibilidad y precio directo por WhatsApp.
              </p>
            </div>
            {waGeneral && (
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn-gold flex items-center gap-2 self-start sm:self-auto">
                <MessageCircle size={16} /> Escribinos
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Search + stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500" />
            <input
              className="input-field pl-10"
              placeholder="Buscar fragancia…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {!loading && !error && (
            <p className="text-sm text-obsidian-500 self-center">
              {disponibles} disponible{disponibles !== 1 ? 's' : ''} · {perfumes.length} en catálogo
            </p>
          )}
        </div>

        {loading && (
          <div className="card p-16 text-center">
            <RefreshCw size={32} className="mx-auto mb-4 text-obsidian-600 animate-spin" />
            <p className="text-obsidian-400 text-sm">Cargando catálogo…</p>
          </div>
        )}

        {error && (
          <div className="card p-8 text-center space-y-4">
            <p className="text-amber-400 text-sm">{error}</p>
            <button className="btn-ghost" onClick={load}>Reintentar</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="card p-16 text-center">
            <Package size={40} className="mx-auto mb-4 text-obsidian-700" />
            <p className="font-display text-xl text-obsidian-400 font-light">
              {perfumes.length === 0 ? 'Catálogo en preparación' : 'Sin resultados'}
            </p>
            <p className="text-obsidian-600 text-sm mt-2">
              {perfumes.length === 0
                ? 'Pronto tendremos novedades. Escribinos por WhatsApp.'
                : 'Probá con otro nombre.'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map(p => (
              <CatalogCard key={p.id} perfume={p} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-obsidian-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-obsidian-700 tracking-wider">
            EPIC SCENT CLUB PARFUM · Fragancias premium
          </p>
          <Link to="/" className="text-xs text-obsidian-600 hover:text-obsidian-400 transition-colors">
            Acceso administración →
          </Link>
        </div>
      </footer>
    </div>
  )
}
