import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { Drawer } from '../components/Drawer.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Icon } from '../components/Icon.jsx'
import { Th } from '../components/Table.jsx'
import { useRelatorioBebes } from '../hooks/useRelatorios.js'
import { relatoriosApi } from '../api/relatorios.js'

export function ReportBebesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [page, setPage]       = useState(1)
  const [busca, setBusca]     = useState(() => searchParams.get('q') ?? '')
  const [status, setStatus]   = useState('vinculados')
  const [filters, setFilters] = useState({})
  const [layout, setLayout]   = useState('table')
  const [sort, setSort]       = useState({ field: 'bebe', dir: 'asc' })
  const [opened, setOpened]   = useState(null)
  const perPage = 20

  const FIELDS = [
    { id: 'bebe', label: 'Acrônimo', type: 'search',
      fetchFn: q => relatoriosApi.getBebes({ busca: `bebe=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'bebe', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(b => b.bebe).filter(Boolean)) },
    { id: 'mae',  label: 'Mãe',     type: 'search',
      fetchFn: q => relatoriosApi.getMaes({ busca: `mae=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'mae', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(m => m.mae).filter(Boolean)) },
    { id: 'sexo', label: 'Sexo',    options: [
      { value: 'masculino', label: 'Masculino' },
      { value: 'feminino',  label: 'Feminino'  },
    ]},
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [`bebe=${busca}`] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching } = useRelatorioBebes({
    page,
    perPage,
    busca: buscaApi,
    sort: sort.field,
    dir: sort.dir,
    status,
  })

  useEffect(() => { setPage(1) }, [busca, filters, sort.field, sort.dir, status])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório de Bebês</h1>
          <p className="page-sub">{(isLoading || isFetching) ? '…' : `${total} bebês encontrados`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cadastro/bebe')}>
          <Icon name="plus" size={14} /> Novo bebê
        </button>
      </div>

      <FilterBar
        fields={FIELDS}
        filters={filters} setFilters={setFilters}
        query={busca} setQuery={setBusca}
        layout={layout} setLayout={setLayout}
      />

      <div className="section" style={{ padding: 8, marginTop: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${status === 'vinculados'    ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('vinculados')}>
            Ativos
          </button>
          <button className={`btn btn-sm ${status === 'desvinculados' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('desvinculados')}>
            Inativos
          </button>
          <button className={`btn btn-sm ${status === 'todos'         ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('todos')}>
            Todos
          </button>
        </div>
      </div>

      {layout === 'table' ? (
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <Th field="bebe"        sort={sort} setSort={setSort}>Acrônimo</Th>
                  <Th field="mae"         sort={sort} setSort={setSort}>Mãe</Th>
                  <Th field="sexo"        sort={sort} setSort={setSort}>Sexo</Th>
                  <Th field="data_nasc"   sort={sort} setSort={setSort}>Nascimento</Th>
                  <Th field="data_cad"    sort={sort} setSort={setSort}>Cadastro</Th>
                  <Th field="peso"        sort={sort} setSort={setSort} num>Peso (g)</Th>
                  <Th field="altura"      sort={sort} setSort={setSort} num>Altura (cm)</Th>
                  <Th field="semana_gest" sort={sort} setSort={setSort} num>Semanas</Th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(isLoading || isFetching) && (
                  <tr><td colSpan={9}><div className="empty">Carregando…</div></td></tr>
                )}
                {!isFetching && resultados.map((b, i) => (
                  <tr key={b.id_bebe ?? `${b.bebe}-${i}`} className="row-action" onClick={() => setOpened(b)}>
                    <td><span className="acro">{b.bebe}</span></td>
                    <td>{b.mae}</td>
                    <td className="muted">{b.sexo}</td>
                    <td className="mono muted">{b.data_nasc}</td>
                    <td className="mono muted">{b.data_cad}</td>
                    <td className="num">{b.peso || '—'}</td>
                    <td className="num">{b.altura || '—'}</td>
                    <td className="num">{b.semana_gest || '—'}</td>
                    <td><Icon name="chevronRight" size={14} className="subtle" /></td>
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
      ) : (
        <>
          <div className="cards-grid">
            {!isFetching && resultados.map((b, i) => (
              <div key={b.id_bebe ?? `${b.bebe}-${i}`} className="rcard" onClick={() => setOpened(b)}>
                <div className="rcard-head">
                  <div>
                    <div className="rcard-name"><span className="acro">{b.bebe}</span></div>
                    <div className="rcard-meta">{b.mae}</div>
                  </div>
                </div>
                <div className="rcard-row"><span>Nascimento</span><span className="mono">{b.data_nasc}</span></div>
                <div className="rcard-row"><span>Sexo</span><span>{b.sexo}</span></div>
                <div className="rcard-row"><span>Peso</span><span>{b.peso ? `${b.peso} g` : '—'}</span></div>
                <div className="rcard-row"><span>Semanas</span><span>{b.semana_gest || '—'}</span></div>
              </div>
            ))}
          </div>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhum bebê encontrado" />
          )}
          <div style={{ marginTop: 16 }}>
            <div className="tbl-wrap">
              <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
            </div>
          </div>
        </>
      )}

      <Drawer open={!!opened} onClose={() => setOpened(null)}>
        {opened && <BebeDetail b={opened} />}
      </Drawer>
    </div>
  )
}

function BebeDetail({ b }) {
  return (
    <>
      <div className="drawer-head">
        <div className="av"><span className="acro" style={{ fontSize: 13 }}>{b.bebe}</span></div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{b.mae}</h3>
          <div className="muted mono" style={{ fontSize: 12, marginTop: 2 }}>
            Nascimento: {b.data_nasc}
          </div>
        </div>
      </div>
      <div className="drawer-body">
        <h4 style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Identificação
        </h4>
        <dl className="kv">
          <dt>Acrônimo</dt>   <dd><span className="acro">{b.bebe}</span></dd>
          <dt>Mãe</dt>        <dd>{b.mae}</dd>
          <dt>Sexo</dt>       <dd>{b.sexo || <span className="subtle">—</span>}</dd>
          <dt>Cadastro</dt>   <dd className="mono">{b.data_cad}</dd>
        </dl>
        <div className="divider" />
        <h4 style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Dados clínicos
        </h4>
        <dl className="kv">
          <dt>Peso</dt>         <dd>{b.peso ? `${b.peso} g` : <span className="subtle">—</span>}</dd>
          <dt>Altura</dt>       <dd>{b.altura ? `${b.altura} cm` : <span className="subtle">—</span>}</dd>
          <dt>Semanas gest.</dt><dd>{b.semana_gest || <span className="subtle">—</span>}</dd>
          <dt>Horário nasc.</dt><dd className="mono">{b.hora || <span className="subtle">—</span>}</dd>
        </dl>
      </div>
    </>
  )
}
