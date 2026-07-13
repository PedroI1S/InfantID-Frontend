import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { Drawer } from '../components/Drawer.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Icon } from '../components/Icon.jsx'
import { Th } from '../components/Table.jsx'
import { useRelatorioMaes } from '../hooks/useRelatorios.js'
import { relatoriosApi } from '../api/relatorios.js'

export function ReportMaesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [page, setPage]       = useState(1)
  const [busca, setBusca]     = useState(() => searchParams.get('q') ?? '')
  const [status, setStatus]   = useState('ativos')
  const [filters, setFilters] = useState({})
  const [layout, setLayout]   = useState('table')
  const [sort, setSort]       = useState({ field: 'mae', dir: 'asc' })
  const [opened, setOpened]   = useState(null)
  const perPage = 20

  const FIELDS = [
    { id: 'mae',    label: 'Nome',   type: 'search',
      fetchFn: q => relatoriosApi.getMaes({ busca: `mae=${q}`, quantidade_por_pagina: 12, status: 'todos', sort: 'mae', dir: 'asc' })
        .then(d => (d.resultados ?? []).map(m => m.mae).filter(Boolean)) },
    { id: 'cidade', label: 'Cidade' },
    { id: 'estado', label: 'Estado', options: [
      { value: 'AC', label: 'AC – Acre' },
      { value: 'AL', label: 'AL – Alagoas' },
      { value: 'AP', label: 'AP – Amapá' },
      { value: 'AM', label: 'AM – Amazonas' },
      { value: 'BA', label: 'BA – Bahia' },
      { value: 'CE', label: 'CE – Ceará' },
      { value: 'DF', label: 'DF – Distrito Federal' },
      { value: 'ES', label: 'ES – Espírito Santo' },
      { value: 'GO', label: 'GO – Goiás' },
      { value: 'MA', label: 'MA – Maranhão' },
      { value: 'MT', label: 'MT – Mato Grosso' },
      { value: 'MS', label: 'MS – Mato Grosso do Sul' },
      { value: 'MG', label: 'MG – Minas Gerais' },
      { value: 'PA', label: 'PA – Pará' },
      { value: 'PB', label: 'PB – Paraíba' },
      { value: 'PR', label: 'PR – Paraná' },
      { value: 'PE', label: 'PE – Pernambuco' },
      { value: 'PI', label: 'PI – Piauí' },
      { value: 'RJ', label: 'RJ – Rio de Janeiro' },
      { value: 'RN', label: 'RN – Rio Grande do Norte' },
      { value: 'RS', label: 'RS – Rio Grande do Sul' },
      { value: 'RO', label: 'RO – Rondônia' },
      { value: 'RR', label: 'RR – Roraima' },
      { value: 'SC', label: 'SC – Santa Catarina' },
      { value: 'SP', label: 'SP – São Paulo' },
      { value: 'SE', label: 'SE – Sergipe' },
      { value: 'TO', label: 'TO – Tocantins' },
    ]},
  ]

  const buscaApi = [
    ...Object.entries(filters).map(([k, v]) => `${k}=${v}`),
    ...(busca ? [`mae=${busca}`] : []),
  ].join(';')

  const { resultados, total, isLoading, isFetching } = useRelatorioMaes({
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
          <h1 className="page-title">Relatório de Mães</h1>
          <p className="page-sub">{(isLoading || isFetching) ? '…' : `${total} mães encontradas`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cadastro/mae')}>
          <Icon name="plus" size={14} /> Nova mãe
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
          <button className={`btn btn-sm ${status === 'ativos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('ativos')}>
            Ativas
          </button>
          <button className={`btn btn-sm ${status === 'inativos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('inativos')}>
            Inativas
          </button>
          <button className={`btn btn-sm ${status === 'todos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus('todos')}>
            Todas
          </button>
        </div>
      </div>

      {layout === 'table' ? (
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <Th field="mae"    sort={sort} setSort={setSort}>Mãe</Th>
                  <Th field="cidade" sort={sort} setSort={setSort}>Cidade</Th>
                  <Th field="estado" sort={sort} setSort={setSort}>Estado</Th>
                  <Th field="data"   sort={sort} setSort={setSort}>Cadastro</Th>
                  <th>Telefone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(isLoading || isFetching) && (
                  <tr><td colSpan={6}><div className="empty">Carregando…</div></td></tr>
                )}
                {!isFetching && resultados.map((m, i) => (
                  <tr key={m.id_mae ?? `${m.mae}-${i}`} className="row-action" onClick={() => setOpened(m)}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.mae}</div>
                      <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{m.email || '—'}</div>
                    </td>
                    <td className="muted">{m.cidade}</td>
                    <td className="muted">{m.estado}</td>
                    <td className="mono muted">{m.data}</td>
                    <td className="muted">{m.telefone || '—'}</td>
                    <td><Icon name="chevronRight" size={14} className="subtle" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && !isFetching && resultados.length === 0 && (
              <EmptyState icon="search" title="Nenhuma mãe encontrada" sub="Ajuste os filtros." />
            )}
          </div>
          <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
        </div>
      ) : (
        <>
          <div className="cards-grid">
            {!isFetching && resultados.map((m, i) => (
              <div key={m.id_mae ?? `${m.mae}-${i}`} className="rcard" onClick={() => setOpened(m)}>
                <div className="rcard-head">
                  <div>
                    <div className="rcard-name">{m.mae}</div>
                    <div className="rcard-meta">{m.cidade} · {m.estado}</div>
                  </div>
                </div>
                <div className="rcard-row"><span>Cadastro</span><span className="mono">{m.data}</span></div>
                <div className="rcard-row"><span>Telefone</span><span>{m.telefone || '—'}</span></div>
                <div className="rcard-row"><span>E-mail</span><span className="muted" style={{ fontSize: 12 }}>{m.email || '—'}</span></div>
              </div>
            ))}
          </div>
          {!isLoading && !isFetching && resultados.length === 0 && (
            <EmptyState icon="search" title="Nenhuma mãe encontrada" />
          )}
          <div style={{ marginTop: 16 }}>
            <div className="tbl-wrap">
              <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
            </div>
          </div>
        </>
      )}

      <Drawer open={!!opened} onClose={() => setOpened(null)}>
        {opened && <MaeDetail m={opened} />}
      </Drawer>
    </div>
  )
}

function MaeDetail({ m }) {
  const initials = m.mae.split(' ').map(p => p[0]).slice(0, 2).join('')
  return (
    <>
      <div className="drawer-head">
        <div className="av">{initials}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{m.mae}</h3>
          <div className="muted mono" style={{ fontSize: 12, marginTop: 2 }}>{m.cidade} · {m.estado}</div>
        </div>
      </div>
      <div className="drawer-body">
        <h4 style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Identificação
        </h4>
        <dl className="kv">
          <dt>E-mail</dt>    <dd>{m.email || <span className="subtle">—</span>}</dd>
          <dt>Telefone</dt>  <dd>{m.telefone || <span className="subtle">—</span>}</dd>
          <dt>Cadastro</dt>  <dd className="mono">{m.data}</dd>
        </dl>
        <div className="divider" />
        <h4 style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Endereço
        </h4>
        <dl className="kv">
          <dt>Rua</dt>    <dd>{m.rua || '—'}</dd>
          <dt>Bairro</dt> <dd>{m.bairro || '—'}</dd>
          <dt>Cidade</dt> <dd>{m.cidade}</dd>
          <dt>Estado</dt> <dd>{m.estado}</dd>
        </dl>
      </div>
      <div className="drawer-foot">
        <button className="btn btn-primary" onClick={() => {}}>Nova coleta</button>
      </div>
    </>
  )
}
