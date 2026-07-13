import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from './Icon.jsx'
import { relatoriosApi } from '../api/relatorios.js'

const NAV_ITEMS = [
  { kind: 'Página', id: 'overview',    label: 'Visão Geral',              icon: 'home',        to: '/overview' },
  { kind: 'Página', id: 'calendar',    label: 'Calendário',               icon: 'calendar',    to: '/calendario' },
  { kind: 'Página', id: 'rel-mae',     label: 'Relatório de Mães',        icon: 'user',        to: '/relatorios/maes' },
  { kind: 'Página', id: 'rel-bebe',    label: 'Relatório de Bebês',       icon: 'baby',        to: '/relatorios/bebes' },
  { kind: 'Página', id: 'rel-coleta',  label: 'Relatório de Coletas',     icon: 'droplet',     to: '/relatorios/coletas' },
  { kind: 'Página', id: 'rel-recol',   label: 'Relatório de Recoletas',   icon: 'activity',    to: '/relatorios/recoletas' },
  { kind: 'Página', id: 'rel-docs',    label: 'Relatório de Documentos',  icon: 'folder',      to: '/relatorios/documentos' },
  { kind: 'Ação',   id: 'new-mae',     label: 'Cadastrar nova mãe',       icon: 'plus',        to: '/cadastro/mae' },
  { kind: 'Ação',   id: 'new-bebe',    label: 'Cadastrar novo bebê',      icon: 'plus',        to: '/cadastro/bebe' },
  { kind: 'Ação',   id: 'new-coleta',  label: 'Iniciar primeira coleta',  icon: 'fingerprint', to: '/coletas/nova' },
  { kind: 'Ação',   id: 'new-recol',   label: 'Registrar recoleta',       icon: 'refresh',     to: '/coletas/recoleta' },
]

export function CommandPalette({ open, onClose }) {
  const [q, setQ]         = useState('')
  const [active, setActive] = useState(0)
  const inputRef          = useRef(null)
  const navigate          = useNavigate()

  // Busca mães com staleTime alto para não recarregar a cada ⌘K
  const { data: maesData } = useQuery({
    queryKey: ['cmd', 'maes', q],
    queryFn: () => relatoriosApi.getMaes({ busca: q, page: 1, quantidade_por_pagina: 10 }),
    enabled: open && q.length >= 1,
    staleTime: 1000 * 60 * 5,
  })

  const { data: bebesData } = useQuery({
    queryKey: ['cmd', 'bebes', q],
    queryFn: () => relatoriosApi.getBebes({ busca: q, page: 1, quantidade_por_pagina: 10 }),
    enabled: open && q.length >= 1,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const items = useMemo(() => {
    const ql = q.toLowerCase().trim()

    const navFiltered = ql
      ? NAV_ITEMS.filter(x => x.label.toLowerCase().includes(ql))
      : NAV_ITEMS

    if (!ql) return navFiltered.slice(0, 12)

    const maes = (maesData?.resultados ?? []).map(m => ({
      kind: 'Mãe', id: `mae-${m.mae}`, label: m.mae,
      meta: m.cidade, icon: 'user', to: `/relatorios/maes?q=${encodeURIComponent(m.mae)}`,
    }))

    const bebes = (bebesData?.resultados ?? []).map(b => ({
      kind: 'Bebê', id: `bebe-${b.bebe}`, label: b.bebe,
      meta: b.mae, icon: 'baby', to: `/relatorios/bebes?q=${encodeURIComponent(b.bebe)}`,
    }))

    return [...navFiltered, ...maes, ...bebes].slice(0, 30)
  }, [q, maesData, bebesData])

  useEffect(() => {
    if (!open) return
    const fn = e => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)) }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const it = items[active]
        if (it) { navigate(it.to); onClose() }
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, items, active, onClose, navigate])

  if (!open) return null

  const grouped = items.reduce((acc, it) => {
    ;(acc[it.kind] = acc[it.kind] || []).push(it)
    return acc
  }, {})

  let i = 0

  return (
    <div className="modal-bg cmd-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal cmd">
        <div className="cmd-input-wrap">
          <Icon name="search" size={16} className="muted" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Buscar páginas, mães, bebês ou ações…"
            value={q}
            onChange={e => { setQ(e.target.value); setActive(0) }}
          />
          <kbd style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>ESC</kbd>
        </div>
        <div className="cmd-list">
          {Object.keys(grouped).length === 0 && (
            <div className="empty"><div>Nada encontrado.</div></div>
          )}
          {Object.entries(grouped).map(([kind, list]) => (
            <div key={kind}>
              <div className="cmd-section-lbl">{kind}</div>
              {list.map(it => {
                const idx = i++
                return (
                  <button
                    key={it.id}
                    className={`cmd-item${idx === active ? ' active' : ''}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => { navigate(it.to); onClose() }}
                  >
                    <Icon name={it.icon} className="cmd-icon" />
                    <div style={{ flex: 1 }}>
                      <div>{it.label}</div>
                      {it.meta && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{it.meta}</div>
                      )}
                    </div>
                    {(kind === 'Página' || kind === 'Ação') && <span className="cmd-meta">↵</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
