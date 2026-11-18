import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}