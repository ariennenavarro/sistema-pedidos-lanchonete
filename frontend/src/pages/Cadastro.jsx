import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const camposIniciais = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  telefone: '',
  password: '',
  confirmacao: '',
}

function mensagensDeErro(dados) {
  if (!dados || typeof dados !== 'object') return 'Não foi possível criar a conta.'
  return Object.values(dados).flat().join(' ')
}

export default function Cadastro() {
  const { usuario, cadastrar } = useAuth()
  const navigate = useNavigate()
  const [campos, setCampos] = useState(camposIniciais)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  function alterar(e) {
    setCampos({ ...campos, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (campos.password !== campos.confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    try {
      const { confirmacao, ...dados } = campos
      await cadastrar(dados)
      navigate('/')
    } catch (err) {
      setErro(mensagensDeErro(err.response?.data))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <h1 className="h3 mb-4 text-center">Criar conta</h1>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-sm-6">
            <label htmlFor="first_name" className="form-label">Nome</label>
            <input id="first_name" name="first_name" className="form-control"
              value={campos.first_name} onChange={alterar} required />
          </div>
          <div className="col-sm-6">
            <label htmlFor="last_name" className="form-label">Sobrenome</label>
            <input id="last_name" name="last_name" className="form-control"
              value={campos.last_name} onChange={alterar} />
          </div>
          <div className="col-sm-6">
            <label htmlFor="username" className="form-label">Usuário</label>
            <input id="username" name="username" className="form-control"
              value={campos.username} onChange={alterar} required />
          </div>
          <div className="col-sm-6">
            <label htmlFor="telefone" className="form-label">Telefone</label>
            <input id="telefone" name="telefone" className="form-control"
              value={campos.telefone} onChange={alterar} />
          </div>
          <div className="col-12">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input id="email" name="email" type="email" className="form-control"
              value={campos.email} onChange={alterar} />
          </div>
          <div className="col-sm-6">
            <label htmlFor="password" className="form-label">Senha</label>
            <input id="password" name="password" type="password" className="form-control"
              value={campos.password} onChange={alterar} required />
          </div>
          <div className="col-sm-6">
            <label htmlFor="confirmacao" className="form-label">Confirmar senha</label>
            <input id="confirmacao" name="confirmacao" type="password" className="form-control"
              value={campos.confirmacao} onChange={alterar} required />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
              {enviando ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </div>
        </form>
        <p className="text-center mt-3">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}