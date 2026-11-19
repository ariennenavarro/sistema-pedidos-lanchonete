import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import { coresStatus, dataHora, moeda } from '../utils/formatar.js'

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(() => {
    api.get('/pedidos/')
      .then((resposta) => {
        setPedidos(resposta.data)
        setErro('')
      })
      .catch(() => setErro('Não foi possível carregar seus pedidos.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 15000)
    return () => clearInterval(intervalo)
  }, [carregar])

  async function cancelar(id) {
    if (!window.confirm('Deseja cancelar este pedido?')) return
    try {
      await api.post(`/pedidos/${id}/cancelar/`)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível cancelar o pedido.')
    }
  }

  if (carregando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Meus pedidos</h1>
        <Link className="btn btn-primary btn-sm" to="/cardapio">Novo pedido</Link>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {pedidos.length === 0 ? (
        <p className="text-body-secondary">
          Você ainda não fez nenhum pedido. <Link to="/cardapio">Ver cardápio</Link>
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-3">
          {pedidos.map((pedido) => (
            <div className="col" key={pedido.id}>
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Pedido #{pedido.id}</strong>
                    <small className="text-body-secondary ms-2">{dataHora(pedido.criado_em)}</small>
                  </div>
                  <span className={`badge text-bg-${coresStatus[pedido.status]}`}>
                    {pedido.status_display}
                  </span>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-2">
                    {pedido.itens.map((item) => (
                      <li key={item.id} className="d-flex justify-content-between">
                        <span>{item.quantidade}x {item.produto_nome}</span>
                        <span>{moeda(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  {pedido.observacao && (
                    <p className="small text-body-secondary mb-2">Obs.: {pedido.observacao}</p>
                  )}
                  {pedido.atendente_nome && (
                    <p className="small mb-0">Atendido por {pedido.atendente_nome}</p>
                  )}
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <span className="small">{pedido.forma_pagamento_display}</span>
                  <div className="d-flex align-items-center gap-2">
                    {pedido.status === 'pendente' && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => cancelar(pedido.id)}
                      >
                        Cancelar
                      </button>
                    )}
                    <strong>{moeda(pedido.total)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}