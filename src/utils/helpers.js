export function calcPrecioVenta(costoBase, comision, porcentajeGanancia) {
  const base = parseFloat(costoBase) || 0
  const com  = parseFloat(comision) || 0
  const pct  = parseFloat(porcentajeGanancia) || 0
  return base + com + (base * pct / 100)
}

export function calcGananciaNeta(costoBase, comision, porcentajeGanancia) {
  return calcPrecioVenta(costoBase, comision, porcentajeGanancia) - (parseFloat(costoBase) || 0) - (parseFloat(comision) || 0)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Simple CSV/text parser for bulk import
// Expected format (one per line): Nombre, Stock, CostoBase, Comision, %Ganancia
export function parseBulkText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const results = []
  const errors  = []

  lines.forEach((line, idx) => {
    // Try comma or semicolon separation
    const parts = line.split(/[,;]/).map(p => p.trim())
    if (parts.length < 5) {
      errors.push(`Línea ${idx + 1}: formato incompleto ("${line}")`)
      return
    }
    const [nombre, stock, costo, comision, ganancia] = parts
    const stockN    = parseInt(stock)
    const costoN    = parseFloat(costo.replace(',', '.'))
    const comisionN = parseFloat(comision.replace(',', '.'))
    const gananciaP = parseFloat(ganancia.replace(',', '.').replace('%',''))

    if (!nombre || isNaN(stockN) || isNaN(costoN) || isNaN(comisionN) || isNaN(gananciaP)) {
      errors.push(`Línea ${idx + 1}: valores inválidos ("${line}")`)
      return
    }
    results.push({ nombre, stock: stockN, costoBase: costoN, comision: comisionN, porcentajeGanancia: gananciaP })
  })

  return { results, errors }
}
