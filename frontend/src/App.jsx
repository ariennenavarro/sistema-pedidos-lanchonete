import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Cardapio from './pages/Cardapio.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import MeusPedidos from './pages/MeusPedidos.jsx'
import PainelAtendente from './pages/PainelAtendente.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route
              path="/cardapio"
              element={
                <RotaProtegida perfis={['cliente']}>
                  <Cardapio />
                </RotaProtegida>
              }
            />
            <Route
              path="/meus-pedidos"
              element={
                <RotaProtegida perfis={['cliente']}>
                  <MeusPedidos />
                </RotaProtegida>
              }
            />
            <Route
              path="/painel"
              element={
                <RotaProtegida perfis={['atendente', 'administrador']}>
                  <PainelAtendente />
                </RotaProtegida>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}