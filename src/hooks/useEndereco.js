import { useQuery } from '@tanstack/react-query'
import { useListQuery } from './useListQuery.js'
import { enderecoApi } from '../api/endereco.js'

export function useEstados() {
  return useListQuery(['endereco', 'estados'], enderecoApi.getEstados)
}

export function useCidades(id_estado) {
  return useListQuery(
    ['endereco', 'cidades', id_estado],
    enderecoApi.getCidades,
    { enabled: !!id_estado, params: { id_estado } }
  )
}

export function useBairros(id_cidade) {
  return useListQuery(
    ['endereco', 'bairros', id_cidade],
    enderecoApi.getBairros,
    { enabled: !!id_cidade, params: { id_cidade } }
  )
}

export function useRuas(id_bairro) {
  return useListQuery(
    ['endereco', 'ruas', id_bairro],
    enderecoApi.getRuas,
    { enabled: !!id_bairro, params: { id_bairro } }
  )
}

export function useCep(cep) {
  const cepLimpo = cep?.replace(/\D/g, '') ?? ''
  return useQuery({
    queryKey: ['endereco', 'cep', cepLimpo],
    queryFn: () => enderecoApi.getByCep(cepLimpo),
    enabled: cepLimpo.length === 8,
    staleTime: 1000 * 60 * 60 * 24,
  })
}
