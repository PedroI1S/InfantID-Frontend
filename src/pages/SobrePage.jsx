import { useState } from 'react'
import { Kpi } from '../components/Kpi.jsx'
import { Pill } from '../components/Pill.jsx'
import { Modal } from '../components/Modal.jsx'
import { Icon } from '../components/Icon.jsx'

import { useToast } from '../hooks/useToast.jsx'
import { useRelatorioBebes, useRelatorioColetas, useRelatorioRecoletas } from '../hooks/useRelatorios.js'
import {
  useTiposDocumento,
  usePostTipoDocumento,
  useDeleteTipoDocumento,
  useImportarDocumentos,
} from '../hooks/useDocumentos.js'

// ── Seção admin de documentos ──────────────────────────────────────────────
function AdminDocumentos({ push }) {
  const [step, setStep]         = useState(null) // null | 'auth' | 'menu' | 'add' | 'remove'
  const [adminPwd, setAdminPwd] = useState('')
  const [pwdInput, setPwdInput] = useState('')
  const [pwdErr, setPwdErr]     = useState('')
  const [removeId, setRemoveId] = useState('')
  const [newTipo, setNewTipo]   = useState({ descricao: '', escopo: 'bebe', obrigatorio: false })
  const [importResult, setImportResult] = useState(null)

  const { data: tiposData } = useTiposDocumento()
  const tipos = tiposData ?? []

  const { mutateAsync: postTipo,    isPending: addingTipo }   = usePostTipoDocumento()
  const { mutateAsync: deleteTipo,  isPending: deletingTipo } = useDeleteTipoDocumento()
  const { mutateAsync: importarDoc, isPending: importing }    = useImportarDocumentos()

  function openModal() {
    setImportResult(null)
    if (adminPwd) { setStep('menu') }
    else { setPwdInput(''); setPwdErr(''); setStep('auth') }
  }

  function close() { setStep(null) }

  function endSession() { setAdminPwd(''); setStep(null); push('Sessão encerrada.') }

  async function confirmAuth(e) {
    e?.preventDefault()
    if (!pwdInput.trim()) { setPwdErr('Digite a senha.'); return }
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwdInput))
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setAdminPwd(hash)
    setPwdInput('')
    setStep('menu')
  }

  async function runImport() {
    try {
      const result = await importarDoc(adminPwd)
      setImportResult(result)
      push('Banco de documentos atualizado!')
    } catch (err) {
      push(err.message || 'Erro ao importar.', 'danger')
    }
  }

  async function commitAdd() {
    if (!newTipo.descricao.trim()) return
    try {
      await postTipo({ data: newTipo, password: adminPwd })
      push(`Tipo "${newTipo.descricao}" adicionado.`)
      setNewTipo({ descricao: '', escopo: 'bebe', obrigatorio: false })
      setStep('menu')
    } catch (err) {
      push(err.message || 'Erro ao adicionar.', 'danger')
    }
  }

  async function commitRemove() {
    if (!removeId) return
    const t = tipos.find(x => String(x.id) === removeId)
    try {
      await deleteTipo({ id: removeId, password: adminPwd })
      push(`Tipo "${t?.descricao}" removido.`)
      setRemoveId('')
      setStep('menu')
    } catch (err) {
      push(err.message || 'Erro ao remover.', 'danger')
    }
  }

  const STEPS = {
    auth: {
      title: 'Área administrativa',
      sub:   'Requer senha de administrador.',
      body: (
        <form onSubmit={confirmAuth}>
          <div className="field">
            <label className="field-lbl">Senha</label>
            <input autoFocus type="password" className="input" value={pwdInput}
              onChange={e => { setPwdInput(e.target.value); setPwdErr('') }}
              placeholder="••••••••" />
            {pwdErr && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{pwdErr}</div>}
          </div>
        </form>
      ),
      footer: (
        <>
          <button className="btn" onClick={close}>Cancelar</button>
          <button className="btn btn-primary" onClick={confirmAuth} disabled={!pwdInput}>Confirmar</button>
        </>
      ),
    },
    menu: {
      title: 'Banco de Documentos',
      sub:   'Sessão de administrador ativa.',
      body: (
        <div className="vstack" style={{ gap: 8 }}>
          {importResult && (
            <div style={{
              padding: '10px 14px', marginBottom: 4,
              background: 'var(--ok-soft)', color: 'var(--ok)',
              borderRadius: 8, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="check" size={13} />
              {`Importação concluída — ${importResult.importados} importados, ${importResult.ignorados} ignorados.`}
            </div>
          )}
          {[
            { icon: 'download', label: importing ? 'Importando…' : 'Atualizar banco',    sub: 'Importar documentos da pasta configurada no servidor', action: runImport,                    disabled: importing },
            { icon: 'plus',     label: 'Novo tipo de documento',  sub: 'Adicionar um novo tipo ao sistema',             action: () => setStep('add') },
            { icon: 'trash',    label: 'Remover tipo de documento', sub: 'Excluir um tipo existente do sistema',         action: () => { setRemoveId(''); setStep('remove') } },
          ].map(({ icon, label, sub, action, disabled }) => (
            <button key={label} className="btn"
              style={{ justifyContent: 'flex-start', gap: 14, height: 'auto', padding: '14px 16px' }}
              onClick={action} disabled={disabled}>
              <Icon name={icon} size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{label}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>
      ),
      footer: (
        <button className="btn btn-ghost" onClick={endSession}>Encerrar sessão</button>
      ),
    },
    add: {
      title: 'Novo tipo de documento',
      sub:   'O novo tipo aparecerá como coluna no relatório.',
      body: (
        <div className="vstack" style={{ gap: 14 }}>
          <div className="field">
            <label className="field-lbl">Descrição<span className="req">*</span></label>
            <input autoFocus className="input"
              value={newTipo.descricao}
              onChange={e => setNewTipo(t => ({ ...t, descricao: e.target.value }))}
              placeholder="Ex.: Carteira de Vacinação" />
          </div>
          <div className="field">
            <label className="field-lbl">Escopo</label>
            <div className="seg" style={{ width: 'fit-content' }}>
              {[['bebe', 'Bebê'], ['mae', 'Mãe']].map(([k, l]) => (
                <button key={k} className={newTipo.escopo === k ? 'active' : ''}
                  onClick={() => setNewTipo(t => ({ ...t, escopo: k }))}>{l}</button>
              ))}
            </div>
          </div>
          <label className="hstack" style={{ gap: 10, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={newTipo.obrigatorio}
              onChange={e => setNewTipo(t => ({ ...t, obrigatorio: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>Documento obrigatório (gera pendência se ausente)</span>
          </label>
        </div>
      ),
      footer: (
        <>
          <button className="btn" onClick={() => setStep('menu')}>Voltar</button>
          <button className="btn btn-primary" onClick={commitAdd} disabled={!newTipo.descricao.trim() || addingTipo}>
            {addingTipo ? 'Adicionando…' : 'Adicionar'}
          </button>
        </>
      ),
    },
    remove: {
      title: 'Remover tipo de documento',
      sub:   'Os documentos já cadastrados desse tipo serão preservados.',
      body: (
        <div className="field">
          <label className="field-lbl">Selecione o tipo</label>
          <select className="select" value={removeId} onChange={e => setRemoveId(e.target.value)}>
            <option value="">— escolher —</option>
            {tipos.map(t => (
              <option key={t.id} value={String(t.id)}>{t.descricao} · {t.escopo}</option>
            ))}
          </select>
        </div>
      ),
      footer: (
        <>
          <button className="btn" onClick={() => setStep('menu')}>Voltar</button>
          <button className="btn btn-danger" onClick={commitRemove} disabled={!removeId || deletingTipo}>
            {deletingTipo ? 'Removendo…' : 'Remover'}
          </button>
        </>
      ),
    },
  }

  const cur = step ? STEPS[step] : null

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <h3 className="section-title">Banco de Documentos</h3>
          <p className="section-sub">
            Gerencie os tipos de documento. Área restrita — requer senha de administrador.
          </p>
        </div>
        <div className="hstack" style={{ gap: 8 }}>
          {adminPwd && <Pill kind="ok"><span className="dot" />Sessão ativa</Pill>}
          <button className="btn" onClick={openModal}>
            <Icon name="settings" size={13} /> Gerenciar
          </button>
        </div>
      </div>

      <Modal open={step !== null} onClose={close} title={cur?.title} sub={cur?.sub} footer={cur?.footer}>
        {cur?.body}
      </Modal>
    </div>
  )
}

// ── Página Sobre ────────────────────────────────────────────────────────────
export function SobrePage() {
  const [push, toastView] = useToast()
  const bebes     = useRelatorioBebes({ page: 1, perPage: 1, status: 'todos' })
  const coletas   = useRelatorioColetas({ page: 1, perPage: 1 })
  const recoletas = useRelatorioRecoletas({ page: 1, perPage: 1, status: 'todos' })

  const fmt = n => n == null ? '…' : n.toLocaleString('pt-BR')

  return (
    <div>
      <div className="sobre-hero">
        <h1>Sobre o InfantID</h1>
        <p>
          Projeto de identificação biométrica neonatal. O objetivo é construir o maior
          banco de biometria neonatal do mundo, com coletas realizadas nas primeiras
          horas de vida do bebê.
        </p>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Kpi label="Bebês"   value={bebes.isLoading ? '…' : fmt(bebes.total)} sub="no programa" />
        <Kpi label="Coletas" value={(coletas.isLoading || recoletas.isLoading) ? '…' : fmt(coletas.total + recoletas.total)} sub="coletas + recoletas" />
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">O projeto</h3>
              <p className="section-sub">Identificação biométrica precoce com IA.</p>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)' }}>
            <p style={{ marginTop: 0 }}>
              Este sistema foi desenvolvido para auxiliar as coletistas do projeto de identificação
              biométrica neonatal <b>InfantID</b>. O objetivo é construir o maior banco de biometria
              neonatal do mundo, por meio de coletas feitas ainda nas primeiras horas de vida do bebê.
            </p>
            <p style={{ marginBottom: 0 }}>
              O grande diferencial do projeto está no uso de <b>Inteligência Artificial</b> para prever
              como as digitais dos bebês se alteram com o tempo, permitindo sua identificação mesmo anos
              depois, com alta precisão. A coleta é feita no hospital, com autorização dos pais, por
              profissionais treinados e remunerados.
            </p>
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Fluxo de trabalho</h3>
              <p className="section-sub">As etapas cobertas pelo sistema.</p>
            </div>
          </div>
          <div className="vstack" style={{ gap: 10 }}>
            {[
              ['Cadastro',   'Mães e bebês',                    'CA'],
              ['Coleta',     'Primeira coleta no hospital',     'CO'],
              ['Recoleta',   'Acompanhamento periódico',        'RE'],
              ['Relatórios', 'Consulta e exportação de dados',  'RL'],
            ].map(([n, r, a]) => (
              <div key={n} className="hstack" style={{ padding: '8px 0' }}>
                <div className="av">{a}</div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 13.5, fontWeight: 500 }}>{n}</b>
                  <div className="muted" style={{ fontSize: 12 }}>{r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Impacto Social</h3>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)' }}>
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              O sistema de identificação pode aumentar a segurança de crianças, especialmente em
              situações como viagens, onde atualmente apenas a certidão de nascimento comprova a
              identidade. A pesquisa visa integrar esses dados a sistemas oficiais, em parceria com
              Secretarias de Segurança Pública e institutos de identificação.
            </p>
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Sistema para Coletistas</h3>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)' }}>
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              Este sistema foi pensado para tornar o trabalho das coletistas mais simples, organizado
              e eficiente, permitindo o gerenciamento de coletas, recoletas, cadastros e relatórios de
              maneira rápida e segura.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">Resultados e Alcance</h3>
          </div>
        </div>
        <div className="vstack" style={{ gap: 10, marginTop: 4 }}>
          {[
            'Mais de 500 bebês acompanhados desde 2023.',
            'Mais de 20 mil coletas já realizadas.',
            'Dados armazenados com segurança e criptografia.',
            'Publicações em revistas científicas da área.',
            'Colaboração internacional e apoio de agências de fomento à pesquisa.',
          ].map(item => (
            <div key={item} className="hstack" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 1 }}>·</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Versão</h3>
        <dl className="kv" style={{ marginTop: 16 }}>
          <dt>Sistema</dt> <dd>InfantID v2</dd>
          <dt>Stack</dt>   <dd>React · Django REST · PostgreSQL</dd>
        </dl>
      </div>

      <AdminDocumentos push={push} />

      {toastView}
    </div>
  )
}
