import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentosApi } from '../api/documentos.js'

export function useTiposDocumento() {
  return useQuery({
    queryKey: ['documentos', 'tipos'],
    queryFn: documentosApi.getTipos,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePostTipoDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ data, password }) => documentosApi.postTipo(data, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documentos', 'tipos'] }),
  })
}

export function useDeleteTipoDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, password }) => documentosApi.deleteTipo(id, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documentos', 'tipos'] }),
  })
}

export function useImportarDocumentos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (password) => documentosApi.postImportar(password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relatorios', 'documentos'] })
      qc.invalidateQueries({ queryKey: ['documentos'] })
    },
  })
}
