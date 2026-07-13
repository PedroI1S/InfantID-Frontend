import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  res => res,
  err => {
    const data = err.response?.data
    const isHtml = typeof data === 'string' && data.trimStart().startsWith('<')
    const message = isHtml
      ? `Erro ${err.response?.status ?? ''} no servidor. Verifique o terminal do backend.`
      : (data?.error || data?.detail || data?.message || err.message || 'Erro desconhecido')
    return Promise.reject(new Error(message))
  }
)

export function withAdminHeader(password) {
  return { headers: { 'X-Admin-Password': password } }
}

export default client
