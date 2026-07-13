import { useState, useEffect } from 'react'
import { FilterBar } from '../components/FilterBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { Drawer } from '../components/Drawer.jsx'
import { Pill } from '../components/Pill.jsx'
import { StatusMeter } from '../components/Pill.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Icon } from '../components/Icon.jsx'
import { Th } from '../components/Table.jsx'
import { useRelatorioDocumentos, useRelatorioDocumentosPivot } from '../hooks/useRelatorios.js'
import { useTiposDocumento } from '../hooks/useDocumentos.js'
import { relatoriosApi } from '../api/relatorios.js'

// ── Célula de status ────────────────────────────────────────────────────────
function DocStatus({ ok, sm }) {
  return (
    <span className={`pill pill-${ok ? 'ok' : 'danger'}`}
      style={sm ? { padding: '2px 7px', fontSize: 10.5 } : null}>
      <span className="dot" />{ok ? 'Cadastrado' : 'Não cadastrado'}
    </span>
  )
}

// ── Célula pivot ─────────────────────────────────────────────────────────────
function PivotCell({ entry }) {
  const ok = !!entry?.status
  return (
    <span className={`pill pill-${ok ? 'ok' : 'danger'}`}
      style={{ fontSize: 11, whiteSpace: 'nowrap' }}
      title={ok ? `Cadastrado em ${entry.data}` : 'Não cadastrado'}>
      <span className="dot" />
      {ok ? 'Cadastrado' : 'Não cadastrado'}
    </span>
  )
}

// ── Drawer de detalhe ────────────────────────────────────────────────────────
function PivotDetail({ row, tipos }) {
  const ok    = tipos.filter(t => row.documentos?.[t]?.status).length
  const total = tipos.length
  return (
    <>
      <div className="drawer-head">
        <span className="acro">{row.bebe}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{row.mae}</h3>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{ok}/{total} documentos</div>
        </div>
        <StatusMeter done={ok} total={total} />
      </div>
      <div className="drawer-body">
        <div className="vstack">
          {tipos.map(tipo => {
            const entry = row.documentos?.[tipo]
            const isOk  = !!entry?.status
            return (
              <div key={tipo} className="hstack"
                style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tipo}</div>
                  {isOk && (
                    <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>
                      Cadastrado em {entry.data}
                    </div>
                  )}
                </div>
                <DocStatus ok={isOk} sm />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Vista lista (por documento) ───────────────────────────────────────────────
function ListView({ page, setPage, busca, setBusca, filters, setFilters, status, setStatus }) {
  const [sort, setSort] = useState({ field: 'bebe', dir: 'asc' })
  const perPage = 20

  const { data: tipos = [] } = useTiposDocumento()

  const FIELDS = [
    {
      id: 'bebe', label: 'Acrônimo', type: 'search',
      fetchFn: q => relatoriosApi.getBebes({ busca: `bebe=${q}`, perPage: 12, status: 'todos', sort: 'bebe', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(b => b.bebe).filter(Boolean)),
    },
    {
      id: 'mae', label: 'Mãe', type: 'search',
      fetchFn: q => relatoriosApi.getMaes({ busca: `mae=${q}`, perPage: 12, status: 'todos', sort: 'mae', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(m => m.mae).filter(Boolean)),
    },
    { id: 'tipo',   label: 'Tipo', options: tipos.map(t => ({ value: t.descricao, label: t.descricao })) },
    { id: 'status', label: 'Status', options: [
      { value: 'Cadastrado',     label: 'Cadastrado' },
      { value: 'Nao Cadastrado', label: 'Não cadastrado' },
    ]},
    { id: 'data',   label: 'Data', type: 'date' },
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [busca] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching } = useRelatorioDocumentos({
    page,
    perPage,
    busca: buscaApi,
    sort: sort.field,
    dir: sort.dir,
    status,
  })
  useEffect(() => { setPage(1) }, [busca, filters, sort.field, sort.dir, status])
  const ok   = resultados.filter(d => d.status).length

  return (
    <>
      <p className="page-sub" style={{ margin: '0 0 var(--gap)' }}>
        {(isLoading || isFetching) ? '…' : `${total} documentos · ${ok}/${resultados.length} nesta página cadastrados`}
      </p>
      <FilterBar fields={FIELDS} filters={filters} setFilters={setFilters}
        query={busca} setQuery={setBusca} />
      <div className="section" style={{ padding: 8, marginTop: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${status === 'vinculados'    ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('vinculados')}>Ativos</button>
          <button className={`btn btn-sm ${status === 'desvinculados' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('desvinculados')}>Inativos</button>
          <button className={`btn btn-sm ${status === 'todos'         ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('todos')}>Todos</button>
        </div>
      </div>
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <Th field="bebe"   sort={sort} setSort={setSort}>Acrônimo</Th>
                <Th field="mae"    sort={sort} setSort={setSort}>Mãe</Th>
                <Th field="tipo"   sort={sort} setSort={setSort}>Tipo</Th>
                <Th field="status" sort={sort} setSort={setSort}>Status</Th>
                <Th field="data"   sort={sort} setSort={setSort}>Data</Th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || isFetching) && (
                <tr><td colSpan={5}><div className="empty">Carregando…</div></td></tr>
              )}
              {!isFetching && resultados.map((d, i) => (
                <tr key={`${d.id_bebe ?? 'b'}-${d.id_tipo_documento ?? 't'}-${i}`}>
                  <td><span className="acro">{d.bebe}</span></td>
                  <td>{d.mae}</td>
                  <td>{d.tipo}</td>
                  <td><DocStatus ok={d.status} /></td>
                  <td className="mono muted">{d.data || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhum documento encontrado" sub="Ajuste os filtros." />
          )}
        </div>
        <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
      </div>
    </>
  )
}

// ── Vista pivot (por bebê) ────────────────────────────────────────────────────
function PivotView({ page, setPage, busca, setBusca, filters, setFilters, status, setStatus }) {
  const [sort, setSort]   = useState({ field: 'bebe', dir: 'asc' })
  const [drawer, setDrawer] = useState(null)
  const perPage = 15

  const FIELDS = [
    { id: 'bebe', label: 'Acrônimo' },
    { id: 'mae',  label: 'Mãe' },
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [busca] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching, data: raw } = useRelatorioDocumentosPivot({
    page,
    perPage,
    busca: buscaApi,
    sort: sort.field,
    dir: sort.dir,
    status,
  })
  const tipos = raw?.tipos ?? []

  useEffect(() => { setPage(1) }, [busca, filters, sort.field, sort.dir, status])

  return (
    <>
      <p className="page-sub" style={{ margin: '0 0 var(--gap)' }}>
        {(isLoading || isFetching) ? '…' : `${total} bebês · ${tipos.length} tipos de documento`}
      </p>
      <FilterBar fields={FIELDS} filters={filters} setFilters={setFilters}
        query={busca} setQuery={setBusca} />
      <div className="section" style={{ padding: 8, marginTop: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${status === 'vinculados'    ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('vinculados')}>Ativos</button>
          <button className={`btn btn-sm ${status === 'desvinculados' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('desvinculados')}>Inativos</button>
          <button className={`btn btn-sm ${status === 'todos'         ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('todos')}>Todos</button>
        </div>
      </div>
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl pivot-table">
            <thead>
              <tr>
                <Th field="bebe" sort={sort} setSort={setSort}>Acrônimo</Th>
                <Th field="mae"  sort={sort} setSort={setSort}>Mãe</Th>
                {tipos.map(t => (
                  <th key={t} className="pivot-col-head" title={t}>
                    <div className="pivot-col-label">{t}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isLoading || isFetching) && (
                <tr><td colSpan={2 + tipos.length}><div className="empty">Carregando…</div></td></tr>
              )}
              {!isFetching && resultados.map((r, i) => (
                <tr key={r.id_bebe ?? i} className="row-action" onClick={() => setDrawer({ row: r, tipos })}>
                  <td><span className="acro">{r.bebe}</span></td>
                  <td>{r.mae}</td>
                  {tipos.map(t => (
                    <td key={t} style={{ textAlign: 'center', padding: 8 }}>
                      <PivotCell entry={r.documentos?.[t]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhum bebê encontrado" sub="Ajuste os filtros." />
          )}
        </div>
        <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}>
        {drawer && <PivotDetail row={drawer.row} tipos={drawer.tipos} />}
      </Drawer>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export function RelatorioDocumentosPage() {
  const [modoPivot, setModoPivot] = useState(false)
  const [page, setPage]           = useState(1)
  const [busca, setBusca]         = useState('')
  const [filters, setFilters]     = useState({})
  const [status, setStatus]       = useState('vinculados')

  function toggleModo(pivot) {
    setModoPivot(pivot)
    setPage(1)
    setBusca('')
    setFilters({})
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório de Documentos</h1>
        </div>
        <div className="seg">
          <button className={!modoPivot ? 'active' : ''} onClick={() => toggleModo(false)}>
            <Icon name="list" size={13} /> Por documento
          </button>
          <button className={modoPivot ? 'active' : ''} onClick={() => toggleModo(true)}>
            <Icon name="grid" size={13} /> Por bebê (pivot)
          </button>
        </div>
      </div>

      {modoPivot ? (
        <PivotView
          page={page} setPage={setPage}
          busca={busca} setBusca={setBusca}
          filters={filters} setFilters={setFilters}
          status={status} setStatus={setStatus}
        />
      ) : (
        <ListView
          page={page} setPage={setPage}
          busca={busca} setBusca={setBusca}
          filters={filters} setFilters={setFilters}
          status={status} setStatus={setStatus}
        />
      )}
    </div>
  )
}
