export function Pill({ kind = 'muted', children, dot = false }) {
  return (
    <span className={`pill pill-${kind}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

export function StatusMeter({ done, total, showBar = true }) {
  if (!total) return <span className="meter empty"><span className="meter-text">—</span></span>
  const pct = (done / total) * 100
  const cls = done === total ? 'full' : done === 0 ? 'empty' : 'partial'
  return (
    <span className={`meter ${cls}`}>
      {showBar && <span className="meter-bar"><i style={{ width: `${pct}%` }} /></span>}
      <span className="meter-text">{done}/{total}</span>
    </span>
  )
}
