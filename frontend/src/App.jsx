import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}