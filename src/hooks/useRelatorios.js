import { usePaginatedQuery } from './usePaginatedQuery.js'
import { relatoriosApi } from '../api/relatorios.js'

export function useRelatorioMaes(params) {
  return usePaginatedQuery(['relatorios', 'maes'], relatoriosApi.getMaes, params)
}

export function useRelatorioBebes(params) {
  return usePaginatedQuery(['relatorios', 'bebes'], relatoriosApi.getBebes, params)
}

export function useRelatorioColetas(params) {
  return usePaginatedQuery(['relatorios', 'coletas'], relatoriosApi.getColetas, params)
}

export function useRelatorioRecoletas(params) {
  return usePaginatedQuery(['relatorios', 'recoletas'], relatoriosApi.getRecoletas, params)
}

export function useRelatorioDocumentos(params) {
  return usePaginatedQuery(['relatorios', 'documentos'], relatoriosApi.getDocumentos, params)
}

export function useRelatorioDocumentosPivot(params) {
  return usePaginatedQuery(['relatorios', 'documentos', 'pivot'], relatoriosApi.getDocumentosPivot, params)
}

export function useRelatorioDesvinculados(params) {
  return usePaginatedQuery(['relatorios', 'desvinculados'], relatoriosApi.getDesvinculados, params)
}
