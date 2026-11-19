export function moeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function dataHora(valor) {
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export const coresStatus = {
  pendente: 'warning',
  em_preparo: 'info',
  pronto: 'primary',
  entregue: 'success',
  cancelado: 'secondary',
}