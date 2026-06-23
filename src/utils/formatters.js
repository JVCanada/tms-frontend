export function formatCurrency(value) {
  const number = Number(value)
  if (Number.isNaN(number)) {
    return '-'
  }
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) {
    return value
  }
  return `${day}/${month}/${year}`
}

export function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('pt-BR')
}

export function todayIsoDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidAccount(account) {
  return /^\d{10}$/.test(account)
}
