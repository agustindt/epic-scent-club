import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import clientesRouter from './routes/clientes.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://epic-scent-club.vercel.app')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes('*')) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'epic-scent-club-api' })
})

app.use('/api/clientes', clientesRouter)

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  await initDb()

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
