import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function sair() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Sistema de Pedidos</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Abrir menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Início</NavLink>
            </li>
            {usuario?.perfil === 'cliente' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/cardapio">Cardápio</NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {usuario ? (
              <>
                <span className="navbar-text">
                  Olá, {usuario.first_name || usuario.username}
                </span>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={sair}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary btn-sm" to="/login">Entrar</Link>
                <Link className="btn btn-primary btn-sm" to="/cadastro">Cadastre-se</Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}