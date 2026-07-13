import { useState, useMemo } from 'react'
import { Icon } from '../components/Icon.jsx'
import { Pill } from '../components/Pill.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useRelatorioRecoletas } from '../hooks/useRelatorios.js'

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CalendarPage() {
  const [month, setMonth]     = useState(() => { const d = new Date(2024, 0, 1); return d })
  const [selected, setSelected] = useState(null)

  const { resultados, isLoading } = useRelatorioRecoletas({ page: 1, perPage: 5000 })

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const startDow = first.getDay()
    const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const days = []

    const prevLast = new Date(month.getFullYear(), month.getMonth(), 0).getDate()
    for (let i = startDow - 1; i >= 0; i--)
      days.push({ day: prevLast - i, muted: true, d: new Date(month.getFullYear(), month.getMonth() - 1, prevLast - i) })
    for (let d = 1; d <= lastDay; d++)
      days.push({ day: d, muted: false, d: new Date(month.getFullYear(), month.getMonth(), d) })
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].d
      const next = new Date(last)
      next.setDate(last.getDate() + 1)
      days.push({ day: next.getDate(), muted: true, d: next })
    }
    return days
  }, [month])

  function parseDate(dateStr) {
    // Converte "DD/MM/YYYY" para "YYYY-MM-DD"
    if (!dateStr) return null
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  function evtsFor(d) {
    const iso = toISO(d)
    return resultados.filter(r => 
      parseDate(r.data_ideal) === iso || parseDate(r.data_recoleta) === iso
    )
  }

  const today = new Date()
  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const selEvts = selected ? evtsFor(selected) : []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendário</h1>
          <p className="page-sub">Recoletas previstas e realizadas.</p>
        </div>
        <div className="hstack">
          <button className="btn btn-icon" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
            <Icon name="chevronLeft" size={14} />
          </button>
          <div className="btn" style={{ textTransform: 'capitalize', minWidth: 200, justifyContent: 'center' }}>
            {monthLabel}
          </div>
          <button className="btn btn-icon" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty">Carregando…</div>
      ) : (
        <div className="cal-grid">
          {DAYS_OF_WEEK.map(d => <div key={d} className="cal-dow">{d}</div>)}
          {cells.map((c, i) => {
            const evts = evtsFor(c.d)
            const isToday = c.d.toDateString() === today.toDateString()
            const isSel   = selected && c.d.toDateString() === selected.toDateString()
            return (
              <div
                key={i}
                className={`cal-cell${c.muted ? ' muted' : ''}${isToday ? ' today' : ''}`}
                style={isSel ? { background: 'var(--surface-2)', boxShadow: 'inset 0 0 0 2px var(--text)' } : null}
                onClick={() => setSelected(c.d)}
              >
                <div className="cal-num">{c.day}</div>
                {evts.slice(0, 2).map((e, j) => (
                  <div key={j} className={`cal-evt${!e.data_recoleta ? ' warn' : ''}`}>
                    {e.bebe} · {e.tipo}
                  </div>
                ))}
                {evts.length > 2 && (
                  <div className="muted" style={{ fontSize: 10.5 }}>+{evts.length - 2}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="section" style={{ marginTop: 24 }}>
        <div className="section-head">
          <div>
            <h3 className="section-title">
              {selected
                ? selected.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Selecione um dia'}
            </h3>
            {selected && <p className="section-sub">{selEvts.length} evento(s)</p>}
          </div>
        </div>
        <div className="vstack">
          {selEvts.map((e, i) => (
            <div key={i} className="hstack" style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
              <span className="acro">{e.bebe}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.tipo}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{e.mae}</div>
              </div>
              {e.data_recoleta
                ? <Pill kind="ok">Concluída</Pill>
                : <Pill kind="warn">Pendente</Pill>}
            </div>
          ))}
          {selected && selEvts.length === 0 && <EmptyState icon="calendar" title="Nenhuma recoleta neste dia" />}
          {!selected && <EmptyState icon="calendar" title="Clique em um dia para ver os eventos" />}
        </div>
      </div>
    </div>
  )
}
