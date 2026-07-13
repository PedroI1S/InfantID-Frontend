import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useListQuery } from './useListQuery.js'
import { usePaginatedQuery } from './usePaginatedQuery.js'
import { recoletaApi } from '../api/recoleta.js'

export function useRecoletas(params) {
  return usePaginatedQuery(['recoleta', 'lista'], recoletaApi.getRecoletas, params)
}

export function useTiposRecoleta() {
  return useListQuery(['recoleta', 'tipos'], recoletaApi.getTiposRecoleta)
}

export function useNascimentoBebe(id_bebe) {
  return useQuery({
    queryKey: ['recoleta', 'nascimento', id_bebe],
    queryFn: () => recoletaApi.getNascimentoBebe(id_bebe),
    enabled: !!id_bebe,
    staleTime: 1000 * 60 * 60,
  })
}

export function usePostRecoleta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recoletaApi.postRecoleta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recoleta'] })
      qc.invalidateQueries({ queryKey: ['relatorios', 'recoletas'] })
    },
  })
}
