import axios from 'axios'
import { API_BASE_URL } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const TRANSFER_DATE_EXCEEDS_50_DAYS_ERROR =
  'Não há taxa aplicável para transferências com prazo superior a 50 dias'

export const TRANSFER_DATE_EXCEEDS_50_DAYS_PREVIEW =
  'Não é possível selecionar uma data acima de 50 dias.'

export async function scheduleTransfer(payload) {
  const { data } = await api.post('/transfers', payload)
  return data
}

export async function listTransfers() {
  const { data } = await api.get('/transfers')
  return data
}

export async function previewFee(amount, transferDate) {
  const { data } = await api.get('/transfers/fee-preview', {
    params: { amount, transferDate }
  })
  return data
}

export function extractErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export function mapPreviewErrorMessage(error) {
  const message = extractErrorMessage(error)

  if (message === TRANSFER_DATE_EXCEEDS_50_DAYS_ERROR) {
    return TRANSFER_DATE_EXCEEDS_50_DAYS_PREVIEW
  }

  return message
}
