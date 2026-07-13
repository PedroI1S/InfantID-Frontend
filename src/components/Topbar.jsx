import { Fragment } from 'react'
import { Icon } from './Icon.jsx'

export function Topbar({ crumbs, onToggleCollapse, collapsed, onToggleTheme, theme, onOpenCmd }) {
  return (
    <div className="topbar">
      <button className="tb-icon-btn" onClick={onToggleCollapse} title="Menu">
        <Icon name={collapsed ? 'menu' : 'chevronLeft'} />
      </button>

      <div className="tb-crumbs">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="tb-crumb-sep"><Icon name="chevronRight" size={11} /></span>}
            {i === crumbs.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </Fragment>
        ))}
      </div>

      <button className="tb-search" onClick={onOpenCmd}>
        <Icon name="search" size={14} />
        <span>Buscar…</span>
        <kbd>⌘K</kbd>
      </button>

      <button className="tb-icon-btn" onClick={onToggleTheme} title="Alternar tema">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </div>
  )
}
