import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useListQuery } from './useListQuery.js'
import { usePaginatedQuery } from './usePaginatedQuery.js'
import { cadastroApi } from '../api/cadastro.js'

export function useMaes(params) {
  return usePaginatedQuery(['cadastro', 'maes'], cadastroApi.getMaes, params)
}

export function useSexo() {
  return useListQuery(['cadastro', 'sexo'], cadastroApi.getSexo)
}

export function useCheckAcronimo(acronimo) {
  return useQuery({
    queryKey: ['cadastro', 'acronimo', acronimo],
    queryFn: () => cadastroApi.checkAcronimo(acronimo),
    enabled: !!acronimo && acronimo.length >= 2,
    staleTime: 1000 * 30,
  })
}

export function usePostResponsavel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cadastroApi.postResponsavel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cadastro', 'maes'] }),
  })
}

export function usePostBebe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cadastroApi.postBebe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relatorios', 'bebes'] })
      qc.invalidateQueries({ queryKey: ['coleta', 'acronimos'] })
    },
  })
}
