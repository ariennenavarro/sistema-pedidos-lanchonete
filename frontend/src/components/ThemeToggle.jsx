import { useEffect, useState } from 'react'

function temaInicial() {
  const salvo = localStorage.getItem('tema')
  if (salvo) return salvo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
    >
      {tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
    </button>
  )
}