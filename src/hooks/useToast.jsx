import { useState, useCallback } from 'react'

export function useToast() {
  const [items, setItems] = useState([])

  const push = useCallback((msg, kind = 'ok') => {
    const id = Math.random()
    setItems(prev => [...prev, { id, msg, kind }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2600)
  }, [])

  const view = (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>
      ))}
    </div>
  )

  return [push, view]
}
