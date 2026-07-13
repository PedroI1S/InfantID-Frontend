import { useState, useRef } from 'react'
import { Icon } from './Icon.jsx'

export function FilterBar({ fields, filters, setFilters, layout, setLayout, query, setQuery, extra }) {
  const [showAdd, setShowAdd] = useState(false)
  const [pickField, setPickField] = useState(fields[0]?.id)
  const [pickVal, setPickVal] = useState('')
  const [searchOpts, setSearchOpts] = useState([])
  const searchTimer = useRef(null)

  const currentFieldDef = fields.find(f => f.id === pickField)
  const currentOptions  = currentFieldDef?.options ?? null
  const currentType     = currentFieldDef?.type ?? null

  function addFilter() {
    if (!pickVal.trim()) return
    let value = pickVal.trim()
    if (currentType === 'date') {
      const [y, m, d] = value.split('-')
      value = `${d}/${m}/${y}`
    }
    setFilters({ ...filters, [pickField]: value })
    setPickVal('')
    setSearchOpts([])
    setShowAdd(false)
  }

  function handleSearchChange(val) {
    setPickVal(val)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setSearchOpts([]); return }
    searchTimer.current = setTimeout(() => {
      currentFieldDef?.fetchFn?.(val.trim())
        .then(opts => setSearchOpts(opts ?? []))
        .catch(() => setSearchOpts([]))
    }, 200)
  }

  function selectSearchOpt(opt) {
    setFilters({ ...filters, [pickField]: opt })
    setPickVal('')
    setSearchOpts([])
    setShowAdd(false)
  }

  function removeFilter(k) {
    const next = { ...filters }
    delete next[k]
    setFilters(next)
  }

  const fieldLabel = id => fields.find(f => f.id === id)?.label || id
  const hasFilters = Object.keys(filters).length > 0

  return (
    <div className="filterbar">
      <div className="fb-row">
        <div className="fb-search">
          <Icon name="search" size={14} className="muted" />
          <input
            placeholder="Filtrar…"
            value={query || ''}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {extra}
        {setLayout && (
          <div className="seg">
            <button className={layout === 'table' ? 'active' : ''} onClick={() => setLayout('table')}>
              <Icon name="list" size={13} /> Tabela
            </button>
            <button className={layout === 'cards' ? 'active' : ''} onClick={() => setLayout('cards')}>
              <Icon name="grid" size={13} /> Cartões
            </button>
          </div>
        )}
      </div>

      {(hasFilters || showAdd) && (
        <div className="fb-row">
          {Object.entries(filters).map(([k, v]) => (
            <span key={k} className="fb-chip">
              <span className="muted">{fieldLabel(k)}:</span>
              <b style={{ fontWeight: 600 }}>{v}</b>
              <button className="fb-chip-x" onClick={() => removeFilter(k)}>
                <Icon name="x" size={10} />
              </button>
            </span>
          ))}
          {!showAdd && (
            <button className="fb-add" onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={11} /> Filtro
            </button>
          )}
          {showAdd && (
            <div className="fb-row" style={{ gap: 6 }}>
              <select
                className="select"
                style={{ height: 28, padding: '0 8px', fontSize: 12 }}
                value={pickField}
                onChange={e => { setPickField(e.target.value); setPickVal(''); setSearchOpts([]) }}
              >
                {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {currentOptions ? (
                <select
                  className="select"
                  style={{ height: 28, padding: '0 8px', fontSize: 12, width: 180 }}
                  value={pickVal}
                  autoFocus
                  onChange={e => setPickVal(e.target.value)}
                >
                  <option value="">— selecionar —</option>
                  {currentOptions.map(o => (
                    <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                  ))}
                </select>
              ) : currentType === 'search' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    style={{ height: 28, fontSize: 12, width: 180 }}
                    placeholder="buscar…"
                    value={pickVal}
                    autoFocus
                    onChange={e => handleSearchChange(e.target.value)}
                    onBlur={() => setTimeout(() => setSearchOpts([]), 150)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addFilter()
                      if (e.key === 'Escape') { setShowAdd(false); setSearchOpts([]) }
                    }}
                  />
                  {searchOpts.length > 0 && (
                    <div style={{
                      position: 'absolute', top: 32, left: 0, zIndex: 100,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,.18)',
                      minWidth: 180, maxHeight: 200, overflowY: 'auto',
                    }}>
                      {searchOpts.map(opt => (
                        <button
                          key={opt}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '6px 10px', fontSize: 12,
                            background: 'none', border: 'none', cursor: 'pointer',
                          }}
                          onMouseDown={e => { e.preventDefault(); selectSearchOpt(opt) }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : currentType === 'date' ? (
                <input
                  type="date"
                  className="input"
                  style={{ height: 28, fontSize: 12, width: 180 }}
                  value={pickVal}
                  autoFocus
                  onChange={e => setPickVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addFilter()
                    if (e.key === 'Escape') setShowAdd(false)
                  }}
                />
              ) : (
                <input
                  className="input"
                  style={{ height: 28, fontSize: 12, width: 180 }}
                  placeholder="valor"
                  value={pickVal}
                  autoFocus
                  onChange={e => setPickVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addFilter()
                    if (e.key === 'Escape') setShowAdd(false)
                  }}
                />
              )}
              <button className="btn btn-sm btn-primary" onClick={addFilter}>OK</button>
              <button className="btn btn-sm btn-ghost" onClick={() => { setShowAdd(false); setSearchOpts([]) }}>Cancelar</button>
            </div>
          )}
          {(hasFilters || query) && !showAdd && (
            <button
              className="btn btn-sm btn-ghost"
              style={{ marginLeft: 'auto' }}
              onClick={() => { setFilters({}); setQuery('') }}
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {!hasFilters && !showAdd && (
        <div className="fb-row">
          <button className="fb-add" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={11} /> Adicionar filtro
          </button>
        </div>
      )}
    </div>
  )
}
