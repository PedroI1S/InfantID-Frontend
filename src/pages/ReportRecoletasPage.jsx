import { useState, useEffect } from 'react'
import { FilterBar } from '../components/FilterBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { Pill } from '../components/Pill.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Th } from '../components/Table.jsx'
import { useRelatorioRecoletas } from '../hooks/useRelatorios.js'
import { relatoriosApi } from '../api/relatorios.js'

const STATUS_OPTS = [
  ['todos',     'Todas'],
  ['pendente',  'Pendentes'],
  ['concluida', 'Concluídas'],
]

export function ReportRecoletasPage() {
  const [page, setPage]             = useState(1)
  const [busca, setBusca]           = useState('')
  const [filters, setFilters]       = useState({})
  const [statusFilter, setStatus]   = useState('todos')
  const [sort, setSort]             = useState({ field: 'data_ideal', dir: 'asc' })
  const perPage = 20

  const FIELDS = [
    { id: 'bebe', label: 'Acrônimo', type: 'search',
      fetchFn: q => relatoriosApi.getBebes({ busca: `bebe=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'bebe', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(b => b.bebe).filter(Boolean)) },
    { id: 'mae',  label: 'Mãe',     type: 'search',
      fetchFn: q => relatoriosApi.getMaes({ busca: `mae=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'mae', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(m => m.mae).filter(Boolean)) },
    { id: 'tipo', label: 'Tipo',    options: [
      { value: '7 dias',   label: '7 dias'   },
      { value: '14 dias',  label: '14 dias'  },
      { value: '1 mês',    label: '1 mês'    },
      { value: '2 meses',  label: '2 meses'  },
      { value: '3 meses',  label: '3 meses'  },
    ]},
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [`bebe=${busca}`] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching } = useRelatorioRecoletas({
    page,
    perPage,
    busca: buscaApi,
    sort: sort.field,
    dir: sort.dir,
    status: statusFilter,
  })

  useEffect(() => { setPage(1) }, [busca, filters, statusFilter, sort.field, sort.dir])

  function statusPill(r) {
    if (r.data_recoleta) return <Pill kind="ok">Concluída</Pill>
    return <Pill kind="warn">Pendente</Pill>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório de Recoletas</h1>
          <p className="page-sub">{(isLoading || isFetching) ? '…' : `${total} recoletas`}</p>
        </div>
      </div>

      <FilterBar
        fields={FIELDS}
        filters={filters} setFilters={setFilters}
        query={busca} setQuery={setBusca}
        extra={
          <div className="seg">
            {STATUS_OPTS.map(([k, l]) => (
              <button
                key={k}
                className={statusFilter === k ? 'active' : ''}
                onClick={() => setStatus(k)}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <Th field="bebe"          sort={sort} setSort={setSort}>Bebê</Th>
                <Th field="mae"           sort={sort} setSort={setSort}>Mãe</Th>
                <Th field="tipo"          sort={sort} setSort={setSort}>Tipo</Th>
                <Th field="data_ideal"    sort={sort} setSort={setSort}>Data ideal</Th>
                <Th field="data_recoleta" sort={sort} setSort={setSort}>Realizada</Th>
                <th>Status</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || isFetching) && (
                <tr><td colSpan={7}><div className="empty">Carregando…</div></td></tr>
              )}
              {!isFetching && resultados.map((r, i) => (
                <tr key={r.id_recoleta ?? `${r.id_bebe}-${r.data_ideal}-${i}`}>
                  <td><span className="acro">{r.bebe}</span></td>
                  <td>{r.mae}</td>
                  <td>{r.tipo}</td>
                  <td className="mono">{r.data_ideal || '—'}</td>
                  <td className="mono">{r.data_recoleta || <span className="subtle">—</span>}</td>
                  <td>{statusPill(r)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{r.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhuma recoleta encontrada" sub="Ajuste os filtros." />
          )}
        </div>
        <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
      </div>
    </div>
  )
}
