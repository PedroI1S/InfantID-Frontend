import { NavLink } from 'react-router-dom'
import { Icon } from './Icon.jsx'

const NAV_ITEMS = [
  { sec: 'Painel' },
  { to: '/overview',             label: 'Visão Geral',      icon: 'home' },
  { to: '/calendario',           label: 'Calendário',       icon: 'calendar' },
  { sec: 'Cadastros' },
  { to: '/cadastro/mae',         label: 'Mãe',              icon: 'user' },
  { to: '/cadastro/bebe',        label: 'Bebê',             icon: 'baby' },
  { sec: 'Coletas' },
  { to: '/coletas/nova',         label: 'Primeira coleta',  icon: 'fingerprint' },
  { to: '/coletas/recoleta',     label: 'Recoleta',         icon: 'refresh' },
  { sec: 'Relatórios' },
  { to: '/relatorios/maes',      label: 'Mães',             icon: 'user' },
  { to: '/relatorios/bebes',     label: 'Bebês',            icon: 'baby' },
  { to: '/relatorios/coletas',   label: 'Coletas',          icon: 'droplet' },
  { to: '/relatorios/recoletas', label: 'Recoletas',        icon: 'activity' },
  { to: '/relatorios/documentos',label: 'Documentos',       icon: 'folder' },
  { to: '/desvinculo',           label: 'Desvínculo',       icon: 'linkBreak' },
  { sec: ' ' },
  { to: '/sobre',                label: 'Sobre',            icon: 'info' },
]

export function Sidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="InfantID" className="sb-logo" />
        <div className="sb-brand-text">
          <b>InfantID</b>
          <small>Biometria neonatal</small>
        </div>
        <button
          className="sb-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
        </button>
      </div>

      <nav className="sb-scroll">
        {NAV_ITEMS.map((item, i) => {
          if (item.sec !== undefined) {
            return <div key={i} className="sb-section">{item.sec}</div>
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} className="sb-icon" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

    </aside>
  )
}
