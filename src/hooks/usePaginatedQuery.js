import { useQuery } from '@tanstack/react-query'

/**
 * Hook genérico para queries paginadas server-side.
 * keepPreviousData evita flash ao trocar de página.
 *
 * @param {string[]} queryKey  - chave base (ex: ['relatorios', 'maes'])
 * @param {Function} fetchFn   - função que recebe { page, perPage, busca, ...params }
 * @param {object}   params    - { page, perPage, busca, ...extras }
 * @returns {{ resultados, total, pagina_atual, isLoading, isFetching, isError, error }}
 */
export function usePaginatedQuery(queryKey, fetchFn, params = {}) {
  const { page = 1, perPage = 20, busca = '', ...extras } = params

  const query = useQuery({
    queryKey: [...queryKey, page, perPage, busca, ...Object.values(extras)],
    queryFn: () => fetchFn({ page, quantidade_por_pagina: perPage, busca, ...extras }),
    placeholderData: prev => prev,
  })

  return {
    data: query.data,
    resultados: query.data?.resultados ?? [],
    total: query.data?.quantidade ?? query.data?.total ?? 0,
    pagina_atual: query.data?.pagina_atual ?? page,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
