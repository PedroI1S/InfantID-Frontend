import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client.js'

function postDesvinculo(data) {
  return client.post('/desvincular-mae', data).then(r => r.data)
}

export function usePostDesvinculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postDesvinculo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relatorios', 'bebes'] })
      qc.invalidateQueries({ queryKey: ['relatorios', 'desvinculados'] })
      qc.invalidateQueries({ queryKey: ['coleta', 'acronimos'] })
    },
  })
}
