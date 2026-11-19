import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Inicio() {
  const { usuario, carregando } = useAuth()

  const equipe = usuario && ['atendente', 'administrador'].includes(usuario.perfil)

  let destino = '/login'
  let texto = 'Comece a fazer seu pedido!'
  if (equipe) {
    destino = '/painel'
    texto = 'Gerencie os pedidos!'
  } else if (usuario) {
    destino = '/cardapio'
  }

  return (
    <div className="py-5 text-center">
      <h1 className="display-5 fw-bold">Sistema de Pedidos</h1>
      <p className="lead text-body-secondary">
        Pedidos de lanchonete sem comanda de papel: o cliente pede pelo celular,
        o atendente acompanha o preparo e o pedido é retirado no balcão.
      </p>

      {!carregando && (
        <div className="mt-4">
          <Link className="btn btn-primary btn-lg px-4" to={destino}>
            {texto}
          </Link>
          {!usuario && (
            <p className="mt-3 text-body-secondary">
              Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}