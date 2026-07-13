import { useMemo } from 'react'
import { Icon } from './Icon.jsx'

export function Pagination({ page, total, perPage, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const nums = useMemo(() => {
    const max = Math.min(7, totalPages)
    const start = Math.max(1, Math.min(page - Math.floor(max / 2), totalPages - max + 1))
    return Array.from({ length: max }, (_, i) => start + i)
  }, [page, totalPages])

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="tbl-foot">
      <div>
        {from}–{to} de <b className="mono" style={{ color: 'var(--text)' }}>{total}</b>
      </div>
      <div className="pag">
        <button className="pag-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>
          <Icon name="chevronLeft" size={13} />
        </button>
        {nums.map(n => (
          <button
            key={n}
            className={`pag-num${n === page ? ' active' : ''}`}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button className="pag-btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
          <Icon name="chevronRight" size={13} />
        </button>
      </div>
    </div>
  )
}
