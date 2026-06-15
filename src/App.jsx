import { Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'
import Catalogo from './pages/Catalogo'

export default function App() {
  return (
    <Routes>
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/*" element={<AdminApp />} />
    </Routes>
  )
}
