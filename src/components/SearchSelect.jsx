import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from './Icon.jsx'

/**
 * Combobox com busca paginada via API.
 *
 * Props:
 *   fetchFn   - função (busca, page) → Promise<{ resultados: [{id, label}] }>
 *   queryKey  - chave para React Query
 *   value     - { id, label } | null
 *   onChange  - (item: { id, label }) => void
 *   placeholder
 *   required
 */
export function SearchSelect({ fetchFn, queryKey, value, onChange, placeholder = 'Buscar…', required = false }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const containerRef      = useRef(null)
  const inputRef          = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, query],
    queryFn: () => fetchFn({ busca: query, page: 1, quantidade_por_pagina: 50 }),
    enabled: open,
    staleTime: 1000 * 30,
  })

  const items = data?.resultados ?? []

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(item) {
    onChange(item)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="input"
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <Icon name="search" size={14} className="muted" />
        <span style={{ flex: 1, color: value ? 'var(--text)' : 'var(--text-subtle)' }}>
          {value ? value.label : placeholder}
        </span>
        {value && (
          <span
            style={{ color: 'var(--text-subtle)', padding: 2 }}
            onClick={e => { e.stopPropagation(); onChange(null) }}
          >
            <Icon name="x" size={12} />
          </span>
        )}
        <Icon name="chevronDown" size={12} className="muted" />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <input
              ref={inputRef}
              className="input"
              style={{ height: 32, fontSize: 13 }}
              placeholder="Filtrar…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {isLoading && <div className="empty" style={{ padding: '12px 16px' }}>Buscando…</div>}
            {!isLoading && items.length === 0 && (
              <div className="empty" style={{ padding: '12px 16px', fontSize: 13 }}>Nenhum resultado.</div>
            )}
            {items.map(item => (
              <button
                key={item.id}
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  display: 'block',
                  background: value?.id === item.id ? 'var(--surface-2)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = value?.id === item.id ? 'var(--surface-2)' : 'transparent'}
                onClick={() => select(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
