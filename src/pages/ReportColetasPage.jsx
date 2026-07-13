import { useState, useEffect } from 'react'
import { FilterBar } from '../components/FilterBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Th } from '../components/Table.jsx'
import { useRelatorioColetas } from '../hooks/useRelatorios.js'
import { relatoriosApi } from '../api/relatorios.js'

export function ReportColetasPage() {
  const [page, setPage]       = useState(1)
  const [busca, setBusca]     = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort]       = useState({ field: 'data', dir: 'desc' })
  const perPage = 20

  const FIELDS = [
    { id: 'bebe', label: 'Acrônimo', type: 'search',
      fetchFn: q => relatoriosApi.getBebes({ busca: `bebe=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'bebe', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(b => b.bebe).filter(Boolean)) },
    { id: 'mae',  label: 'Mãe',     type: 'search',
      fetchFn: q => relatoriosApi.getMaes({ busca: `mae=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'mae', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(m => m.mae).filter(Boolean)) },
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [`bebe=${busca}`] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching } = useRelatorioColetas({
    page,
    perPage,
    busca: buscaApi,
    sort: sort.field,
    dir: sort.dir,
  })

  useEffect(() => { setPage(1) }, [busca, filters, sort.field, sort.dir])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório de Coletas</h1>
          <p className="page-sub">{(isLoading || isFetching) ? '…' : `${total} coletas registradas`}</p>
        </div>
      </div>

      <FilterBar
        fields={FIELDS}
        filters={filters} setFilters={setFilters}
        query={busca} setQuery={setBusca}
      />

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <Th field="data"      sort={sort} setSort={setSort}>Data</Th>
                <Th field="hora"      sort={sort} setSort={setSort}>Hora</Th>
                <Th field="bebe"      sort={sort} setSort={setSort}>Bebê</Th>
                <Th field="mae"       sort={sort} setSort={setSort}>Mãe</Th>
                <Th field="coletista" sort={sort} setSort={setSort}>Coletista</Th>
                <Th field="local"     sort={sort} setSort={setSort}>Local</Th>
                <th>Scanner</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || isFetching) && (
                <tr><td colSpan={8}><div className="empty">Carregando…</div></td></tr>
              )}
              {!isFetching && resultados.map((c, i) => (
                <tr key={c.id_coleta ?? `${c.id_bebe}-${c.data}-${i}`}>
                  <td className="mono">{c.data}</td>
                  <td className="mono muted">{c.hora}</td>
                  <td><span className="acro">{c.bebe}</span></td>
                  <td>{c.mae}</td>
                  <td className="muted">{c.coletista}</td>
                  <td className="muted">{c.local}</td>
                  <td className="muted">{c.scanner}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{c.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhuma coleta encontrada" sub="Ajuste os filtros." />
          )}
        </div>
        <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
      </div>
    </div>
  )
}
