import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { CommandPalette } from './components/CommandPalette.jsx'
import { EmptyState } from './components/EmptyState.jsx'
import { useToast } from './hooks/useToast.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { ReportMaesPage } from './pages/ReportMaesPage.jsx'
import { ReportBebesPage } from './pages/ReportBebesPage.jsx'
import { ReportColetasPage } from './pages/ReportColetasPage.jsx'
import { ReportRecoletasPage } from './pages/ReportRecoletasPage.jsx'
import { CalendarPage } from './pages/CalendarPage.jsx'
import { SobrePage } from './pages/SobrePage.jsx'
import { CadastroMaePage } from './pages/CadastroMaePage.jsx'
import { CadastroBebePage } from './pages/CadastroBebePage.jsx'
import { NovaColetaPage } from './pages/NovaColetaPage.jsx'
import { RecoletaPage } from './pages/RecoletaPage.jsx'
import { DesvinculoPage } from './pages/DesvinculoPage.jsx'
import { RelatorioDocumentosPage } from './pages/RelatorioDocumentosPage.jsx'

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) ?? initial } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, value) } catch {}
  }, [key, value])
  return [value, setValue]
}

const ROUTE_META = {
  '/overview':              { crumbs: ['Painel', 'Visão Geral'] },
  '/calendario':            { crumbs: ['Calendário'] },
  '/cadastro/mae':          { crumbs: ['Cadastros', 'Mãe'] },
  '/cadastro/bebe':         { crumbs: ['Cadastros', 'Bebê'] },
  '/coletas/nova':          { crumbs: ['Coletas', 'Primeira coleta'] },
  '/coletas/recoleta':      { crumbs: ['Coletas', 'Recoleta'] },
  '/relatorios/maes':       { crumbs: ['Relatórios', 'Mães'] },
  '/relatorios/bebes':      { crumbs: ['Relatórios', 'Bebês'] },
  '/relatorios/coletas':    { crumbs: ['Relatórios', 'Coletas'] },
  '/relatorios/recoletas':  { crumbs: ['Relatórios', 'Recoletas'] },
  '/relatorios/documentos': { crumbs: ['Relatórios', 'Documentos'] },
  '/desvinculo':            { crumbs: ['Desvínculo'] },
  '/sobre':                 { crumbs: ['Sobre'] },
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('infantid-theme', 'light')
  const [density, setDensity] = useLocalStorage('infantid-density', 'comfortable')
  const [collapsed, setCollapsed] = useLocalStorage('infantid-collapsed', 'false')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [push, toastView] = useToast()
  const location = useLocation()

  const isCollapsed = collapsed === 'true'
  const meta = ROUTE_META[location.pathname] || { crumbs: ['InfantID'] }

  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen(o => !o)
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  return (
    <div
      className="app"
      data-theme={theme}
      data-density={density}
      data-collapsed={isCollapsed ? 'true' : undefined}
    >
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={() => setCollapsed(isCollapsed ? 'false' : 'true')}
      />

      <main className="main">
        <Topbar
          crumbs={meta.crumbs}
          collapsed={isCollapsed}
          onToggleCollapse={() => setCollapsed(isCollapsed ? 'false' : 'true')}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenCmd={() => setCmdOpen(true)}
        />

        <div className="page">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview"              element={<OverviewPage />} />
            <Route path="/calendario"            element={<CalendarPage />} />
            <Route path="/cadastro/mae"          element={<CadastroMaePage />} />
            <Route path="/cadastro/bebe"         element={<CadastroBebePage />} />
            <Route path="/coletas/nova"          element={<NovaColetaPage />} />
            <Route path="/coletas/recoleta"      element={<RecoletaPage />} />
            <Route path="/relatorios/maes"       element={<ReportMaesPage />} />
            <Route path="/relatorios/bebes"      element={<ReportBebesPage />} />
            <Route path="/relatorios/coletas"    element={<ReportColetasPage />} />
            <Route path="/relatorios/recoletas"  element={<ReportRecoletasPage />} />
            <Route path="/relatorios/documentos" element={<RelatorioDocumentosPage />} />
            <Route path="/desvinculo"            element={<DesvinculoPage />} />
            <Route path="/sobre"                 element={<SobrePage />} />
          </Routes>
        </div>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      {toastView}
    </div>
  )
}

function Placeholder({ title, icon }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">Esta página será implementada nas próximas fases.</p>
        </div>
      </div>
      <div className="section">
        <EmptyState icon={icon} title="Em construção" sub="Volte em breve." />
      </div>
    </div>
  )
}
