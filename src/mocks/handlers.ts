import { http, HttpResponse } from 'msw'

// Handlers de exemplo; ampliaremos conforme os testes precisarem.
export const handlers = [
  // Exemplo: endpoint fictício
  http.get('/health', () => HttpResponse.json({ status: 'ok' })),
]

