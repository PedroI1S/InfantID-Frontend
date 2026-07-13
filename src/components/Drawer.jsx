import { useEffect } from 'react'

export function Drawer({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <div className="drawer">{children}</div>
    </>
  )
}
