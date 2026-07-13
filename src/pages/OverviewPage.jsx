import { useNavigate } from 'react-router-dom'
import { Kpi } from '../components/Kpi.jsx'
import { Pill } from '../components/Pill.jsx'
import { Icon } from '../components/Icon.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useRelatorioMaes, useRelatorioBebes, useRelatorioRecoletas } from '../hooks/useRelatorios.js'

export function OverviewPage() {
  const navigate = useNavigate()
  const maes      = useRelatorioMaes({ page: 1, perPage: 1 })
  const bebes     = useRelatorioBebes({ page: 1, perPage: 1 })
  const recoletas = useRelatorioRecoletas({ page: 1, perPage: 8 })

  const proximas = recoletas.resultados.filter(r => !r.data_recoleta)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-sub">Estado atual do programa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/coletas/nova')}>
          <Icon name="plus" size={14} /> Nova coleta
        </button>
      </div>

      <div className="kpis">
        <Kpi label="Mães" value={maes.isLoading ? '…' : maes.total} sub="cadastradas" />
        <Kpi label="Bebês" value={bebes.isLoading ? '…' : bebes.total} sub="no programa" />
        <Kpi label="Recoletas" value={recoletas.isLoading ? '…' : recoletas.total} sub="registradas" />
        <Kpi label="Pendentes" value={recoletas.isLoading ? '…' : proximas.length} sub="nesta página" />
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Últimas recoletas</h3>
              <p className="section-sub">Registros mais recentes.</p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/relatorios/recoletas')}>
              Ver todas <Icon name="chevronRight" size={12} />
            </button>
          </div>
          <div className="vstack" style={{ gap: 0 }}>
            {recoletas.isLoading && <div className="empty">Carregando…</div>}
            {recoletas.resultados.map((r, i) => (
              <div key={i} className="upcoming-row">
                <div className="upcoming-date mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {r.data_recoleta || r.data_ideal || '—'}
                </div>
                <div>
                  <div className="upcoming-title">
                    <span className="acro" style={{ marginRight: 8 }}>{r.bebe}</span>
                    {r.tipo}
                  </div>
                  <div className="upcoming-sub">{r.mae}</div>
                </div>
                {r.data_recoleta
                  ? <Pill kind="ok">Concluída</Pill>
                  : <Pill kind="warn">Pendente</Pill>}
              </div>
            ))}
            {!recoletas.isLoading && recoletas.resultados.length === 0 && (
              <EmptyState icon="activity" title="Nenhuma recoleta registrada" />
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Acesso rápido</h3>
              <p className="section-sub">Ações frequentes.</p>
            </div>
          </div>
          <div className="vstack">
            {[
              { label: 'Cadastrar mãe',      to: '/cadastro/mae',          icon: 'user' },
              { label: 'Cadastrar bebê',      to: '/cadastro/bebe',         icon: 'baby' },
              { label: 'Nova coleta',         to: '/coletas/nova',          icon: 'fingerprint' },
              { label: 'Registrar recoleta',  to: '/coletas/recoleta',      icon: 'refresh' },
              { label: 'Relatório de mães',   to: '/relatorios/maes',       icon: 'user' },
              { label: 'Relatório de bebês',  to: '/relatorios/bebes',      icon: 'baby' },
            ].map(item => (
              <button
                key={item.to}
                className="btn"
                style={{ justifyContent: 'flex-start', gap: 10 }}
                onClick={() => navigate(item.to)}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
