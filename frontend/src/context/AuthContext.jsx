import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) {
      setCarregando(false)
      return
    }
    api.get('/auth/me/')
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => localStorage.removeItem('access'))
      .finally(() => setCarregando(false))
  }, [])

  async function login(username, password) {
    const resposta = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', resposta.data.access)
    const me = await api.get('/auth/me/')
    setUsuario(me.data)
    return me.data
  }

  async function cadastrar(dados) {
    await api.post('/auth/cadastro/', dados)
    return login(dados.username, dados.password)
  }

  function logout() {
    localStorage.removeItem('access')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}