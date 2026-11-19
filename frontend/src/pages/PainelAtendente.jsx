import { useCallback, useEffect, useState } from 'react'
import api from '../services/api.js'
import { dataHora, moeda } from '../utils/formatar.js'

const colunas = [
  { status: 'pendente', titulo: 'Pendentes', cor: 'warning' },
  { status: 'em_preparo', titulo: 'Em preparo', cor: 'info' },
  { status: 'pronto', titulo: 'Prontos', cor: 'primary' },
]

const proximaEtapa = {
  pendente: { status: 'em_preparo', texto: 'Iniciar preparo' },
  em_preparo: { status: 'pronto', texto: 'Marcar como pronto' },
  pronto: { status: 'entregue', texto: 'Confirmar entrega' },
}

export default function PainelAtendente() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [atualizando, setAtualizando] = useState(null)

  const carregar = useCallback(() => {
    api.get('/pedidos/')
      .then((resposta) => {
        setPedidos(resposta.data)
        setErro('')
      })
      .catch(() => setErro('Não foi possível carregar os pedidos.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 10000)
    return () => clearInterval(intervalo)
  }, [carregar])

  async function mudarStatus(id, status) {
    setAtualizando(id)
    try {
      await api.post(`/pedidos/${id}/status/`, { status })
      carregar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível atualizar o pedido.')
    } finally {
      setAtualizando(null)
    }
  }

  function cancelar(id) {
    if (window.confirm('Deseja cancelar este pedido?')) {
      mudarStatus(id, 'cancelado')
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
      <h1 className="h3 mb-3">Painel de pedidos</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="row g-3">
        {colunas.map((coluna) => {
          const lista = pedidos.filter((pedido) => pedido.status === coluna.status).reverse()

          return (
            <div className="col-md-4" key={coluna.status}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <h2 className="h5 mb-0">{coluna.titulo}</h2>
                <span className={`badge text-bg-${coluna.cor}`}>{lista.length}</span>
              </div>

              {lista.length === 0 ? (
                <p className="small text-body-secondary">Nenhum pedido.</p>
              ) : (
                lista.map((pedido) => (
                  <div className="card mb-3" key={pedido.id}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <strong>#{pedido.id} · {pedido.cliente_nome || 'Cliente'}</strong>
                      <small className="text-body-secondary">{dataHora(pedido.criado_em)}</small>
                    </div>
                    <div className="card-body">
                      <ul className="list-unstyled mb-2">
                        {pedido.itens.map((item) => (
                          <li key={item.id}>{item.quantidade}x {item.produto_nome}</li>
                        ))}
                      </ul>
                      {pedido.observacao && (
                        <p className="small text-danger-emphasis mb-2">Obs.: {pedido.observacao}</p>
                      )}
                      {pedido.atendente_nome && (
                        <p className="small text-body-secondary mb-2">Atendente: {pedido.atendente_nome}</p>
                      )}
                      <div className="d-flex justify-content-between small">
                        <span>{pedido.forma_pagamento_display}</span>
                        <strong>{moeda(pedido.total)}</strong>
                      </div>
                    </div>
                    <div className="card-footer d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm flex-grow-1"
                        disabled={atualizando === pedido.id}
                        onClick={() => mudarStatus(pedido.id, proximaEtapa[pedido.status].status)}
                      >
                        {proximaEtapa[pedido.status].texto}
                      </button>
                      {pedido.status !== 'pronto' && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={atualizando === pedido.id}
                          onClick={() => cancelar(pedido.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}