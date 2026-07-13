import { useEffect } from 'react'

export function Modal({ open, onClose, title, sub, children, footer, size }) {
  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={size === 'lg' ? { width: 'min(820px, 95vw)' } : null}>
        {title && (
          <div className="modal-head">
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
