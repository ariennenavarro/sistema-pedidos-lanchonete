import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { moeda } from '../utils/formatar.js'

const formasPagamento = [
  { valor: 'pix', nome: 'Pix' },
  { valor: 'cartao', nome: 'Cartão' },
  { valor: 'dinheiro', nome: 'Dinheiro' },
]

function mensagemDeErro(dados) {
  if (!dados || typeof dados !== 'object') return 'Não foi possível enviar o pedido.'
  return Object.values(dados).flat().join(' ')
}

export default function Cardapio() {
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [categoriaAtual, setCategoriaAtual] = useState(null)
  const [carrinho, setCarrinho] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [observacao, setObservacao] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/categorias/'), api.get('/produtos/')])
      .then(([respostaCategorias, respostaProdutos]) => {
        setCategorias(respostaCategorias.data)
        setProdutos(respostaProdutos.data)
      })
      .catch(() => setMensagem({ tipo: 'danger', texto: 'Não foi possível carregar o cardápio.' }))
      .finally(() => setCarregando(false))
  }, [])

  const produtosVisiveis = categoriaAtual
    ? produtos.filter((produto) => produto.categoria === categoriaAtual)
    : produtos

  const total = carrinho.reduce(
    (soma, item) => soma + Number(item.produto.preco) * item.quantidade,
    0,
  )

  function adicionar(produto) {
    setMensagem(null)
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produto.id === produto.id)
      if (existente) {
        return atual.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
      }
      return [...atual, { produto, quantidade: 1 }]
    })
  }

  function alterarQuantidade(id, diferenca) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.produto.id === id ? { ...item, quantidade: item.quantidade + diferenca } : item,
        )
        .filter((item) => item.quantidade > 0),
    )
  }

  async function finalizar() {
    setEnviando(true)
    setMensagem(null)
    try {
      await api.post('/pedidos/', {
        forma_pagamento: formaPagamento,
        observacao,
        itens: carrinho.map((item) => ({ produto: item.produto.id, quantidade: item.quantidade })),
      })
      navigate('/meus-pedidos')
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: mensagemDeErro(err.response?.data) })
    } finally {
      setEnviando(false)
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
      <h1 className="h3 mb-3">Cardápio</h1>
      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className={`btn btn-sm ${categoriaAtual === null ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setCategoriaAtual(null)}
            >
              Todos
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={`btn btn-sm ${categoriaAtual === categoria.id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setCategoriaAtual(categoria.id)}
              >
                {categoria.nome}
              </button>
            ))}
          </div>

          {produtosVisiveis.length === 0 ? (
            <p className="text-body-secondary">Nenhum produto disponível nesta categoria.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {produtosVisiveis.map((produto) => (
                <div className="col" key={produto.id}>
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <span className="badge text-bg-secondary align-self-start mb-2">
                        {produto.categoria_nome}
                      </span>
                      <h2 className="h5 card-title">{produto.nome}</h2>
                      {produto.descricao && (
                        <p className="card-text small text-body-secondary">{produto.descricao}</p>
                      )}
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{moeda(produto.preco)}</span>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => adicionar(produto)}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card sticky-lg-top" style={{ top: '1rem' }}>
            <div className="card-body">
              <h2 className="h5 card-title">Seu pedido</h2>

              {carrinho.length === 0 ? (
                <p className="text-body-secondary mb-0">Adicione produtos do cardápio.</p>
              ) : (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    {carrinho.map((item) => (
                      <li
                        key={item.produto.id}
                        className="list-group-item px-0 d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div>{item.produto.nome}</div>
                          <small className="text-body-secondary">
                            {moeda(Number(item.produto.preco) * item.quantidade)}
                          </small>
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => alterarQuantidade(item.produto.id, -1)}
                          >
                            −
                          </button>
                          <span className="btn btn-outline-secondary disabled">{item.quantidade}</span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => alterarQuantidade(item.produto.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-3">
                    <label htmlFor="pagamento" className="form-label">Forma de pagamento</label>
                    <select
                      id="pagamento"
                      className="form-select"
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                      {formasPagamento.map((forma) => (
                        <option key={forma.valor} value={forma.valor}>{forma.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="observacao" className="form-label">Observação</label>
                    <textarea
                      id="observacao"
                      className="form-control"
                      rows="2"
                      placeholder="Ex.: sem cebola"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                    />
                  </div>

                  <div className="d-flex justify-content-between fw-bold mb-3">
                    <span>Total</span>
                    <span>{moeda(total)}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={finalizar}
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : 'Fazer pedido'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}