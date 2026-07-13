import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useListQuery } from './useListQuery.js'
import { usePaginatedQuery } from './usePaginatedQuery.js'
import { coletaApi } from '../api/coleta.js'

export function useAcronimos(params) {
  return usePaginatedQuery(['coleta', 'acronimos'], coletaApi.getAcronimos, params)
}

export function useColetistas() {
  return useListQuery(['coleta', 'coletistas'], coletaApi.getColetistas)
}

export function useScanners() {
  return useListQuery(['coleta', 'scanners'], coletaApi.getScanners)
}

export function useLocaisColeta() {
  return useListQuery(['coleta', 'locais'], coletaApi.getLocaisColeta)
}

export function useProcedimentos() {
  return useListQuery(['coleta', 'procedimentos'], coletaApi.getProcedimentos)
}

export function useProtocolos() {
  return useListQuery(['coleta', 'protocolos'], coletaApi.getProtocolos)
}

export function usePostColeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: coletaApi.postColeta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relatorios', 'coletas'] })
      qc.invalidateQueries({ queryKey: ['coleta', 'acronimos'] })
    },
  })
}
