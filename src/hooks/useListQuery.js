import { useQuery } from '@tanstack/react-query'

/**
 * Hook para listas simples (dropdowns, selects).
 * staleTime alto evita refetch desnecessário em dados estáticos.
 *
 * @param {string[]} queryKey
 * @param {Function} fetchFn
 * @param {object}   options  - { enabled, params }
 */
export function useListQuery(queryKey, fetchFn, { enabled = true, params = {} } = {}) {
  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetchFn(params),
    staleTime: 1000 * 60 * 10,
    enabled,
  })

  return {
    resultados: query.data?.resultados ?? query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
