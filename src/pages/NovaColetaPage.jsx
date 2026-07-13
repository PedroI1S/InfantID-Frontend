import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast.jsx'
import { SearchSelect } from '../components/SearchSelect.jsx'
import { Icon } from '../components/Icon.jsx'
import { usePostColeta, useColetistas, useScanners, useLocaisColeta, useProcedimentos, useProtocolos } from '../hooks/useColeta.js'
import { coletaApi } from '../api/coleta.js'

const STEPS = [
  { n: '1', t: 'Bebê',      sub: 'Selecionar acrônimo' },
  { n: '2', t: 'Detalhes',  sub: 'Preencher dados da coleta' },
  { n: '3', t: 'Confirmar', sub: 'Revisar e salvar' },
]

function Field({ label, required: req, children }) {
  return (
    <div className="field">
      <label className="field-lbl">{label}{req && <span className="req">*</span>}</label>
      {children}
    </div>
  )
}

export function NovaColetaPage() {
  const navigate = useNavigate()
  const [push, toastView] = useToast()
  const [step, setStep]   = useState(0)

  const [bebe, setBebe]   = useState(null)
  const [form, setForm]   = useState({
    idScanner: '', idColetista: '', idLocalColeta: '',
    idProcedimentoLimpeza: '', idProtocoloColeta: '',
    dataColeta: new Date().toISOString().slice(0, 10),
    horarioColeta: new Date().toTimeString().slice(0, 5),
    observacao: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { resultados: coletistas }  = useColetistas()
  const { resultados: scanners }    = useScanners()
  const { resultados: locais }      = useLocaisColeta()
  const { resultados: procedimentos } = useProcedimentos()
  const { resultados: protocolos }  = useProtocolos()
  const { mutateAsync: postColeta, isPending } = usePostColeta()

  const step1Ok = !!bebe
  const step2Ok = form.idScanner && form.idColetista && form.idLocalColeta &&
                  form.idProcedimentoLimpeza && form.idProtocoloColeta &&
                  form.dataColeta && form.horarioColeta

  async function handleSave() {
    try {
      await postColeta({
        id_cadastro_bebe: bebe.id,
        id_scanner: Number(form.idScanner),
        id_coletista: Number(form.idColetista),
        id_local_coleta: Number(form.idLocalColeta),
        id_procedimento_limpeza: Number(form.idProcedimentoLimpeza),
        id_protocolo: Number(form.idProtocoloColeta),
        data_coleta: form.dataColeta,
        horario_coleta: form.horarioColeta,
        observacao: form.observacao,
      })
      push('Coleta salva com sucesso!')
      navigate('/relatorios/coletas')
    } catch (err) {
      push(err.message || 'Erro ao salvar.', 'danger')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Primeira Coleta</h1>
          <p className="page-sub">Registro biométrico inicial.</p>
        </div>
      </div>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`step${step === i ? ' current' : step > i ? ' done' : ''}`}
            onClick={() => { if (i < step || (i === 1 && step1Ok) || (i === 2 && step2Ok)) setStep(i) }}
          >
            <span className="step-n">{step > i ? <Icon name="check" size={12} /> : s.n}</span>
            <span className="step-lbl"><b>{s.t}</b><small>{s.sub}</small></span>
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="section">
          <div className="section-head">
            <h3 className="section-title">Selecionar bebê</h3>
          </div>
          <Field label="Bebê (acrônimo)" required>
            <SearchSelect
              queryKey={['coleta', 'acronimos-select']}
              fetchFn={coletaApi.getAcronimos}
              value={bebe}
              onChange={setBebe}
              placeholder="Buscar por acrônimo ou nome…"
            />
          </Field>
          {bebe && (
            <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 8 }}>
              <dl className="kv">
                <dt>Bebê</dt><dd><span className="acro">{bebe.label}</span></dd>
              </dl>
            </div>
          )}
          <div className="hstack" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={!step1Ok} onClick={() => setStep(1)}>
              Próximo <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h3 className="section-title">Dados da coleta</h3>
              <p className="section-sub">Bebê: <span className="acro">{bebe?.label}</span></p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Field label="Data" required>
              <input className="input" type="date" value={form.dataColeta}
                onChange={e => set('dataColeta', e.target.value)} />
            </Field>
            <Field label="Horário" required>
              <input className="input" type="time" value={form.horarioColeta}
                onChange={e => set('horarioColeta', e.target.value)} />
            </Field>
            <Field label="Coletista" required>
              <select className="select" value={form.idColetista}
                onChange={e => set('idColetista', e.target.value)}>
                <option value="">— selecionar —</option>
                {coletistas.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Scanner" required>
              <select className="select" value={form.idScanner}
                onChange={e => set('idScanner', e.target.value)}>
                <option value="">— selecionar —</option>
                {scanners.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Local de coleta" required>
              <select className="select" value={form.idLocalColeta}
                onChange={e => set('idLocalColeta', e.target.value)}>
                <option value="">— selecionar —</option>
                {locais.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Procedimento de limpeza" required>
              <select className="select" value={form.idProcedimentoLimpeza}
                onChange={e => set('idProcedimentoLimpeza', e.target.value)}>
                <option value="">— selecionar —</option>
                {procedimentos.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Protocolo" required>
              <select className="select" value={form.idProtocoloColeta}
                onChange={e => set('idProtocoloColeta', e.target.value)}>
                <option value="">— selecionar —</option>
                {protocolos.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <div style={{ gridColumn: 'span 3' }}>
              <Field label="Observações">
                <textarea className="textarea" value={form.observacao}
                  onChange={e => set('observacao', e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="hstack" style={{ marginTop: 24, justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => setStep(0)}>
              <Icon name="chevronLeft" size={14} /> Voltar
            </button>
            <button className="btn btn-primary" disabled={!step2Ok} onClick={() => setStep(2)}>
              Próximo <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="section">
          <div className="section-head">
            <h3 className="section-title">Confirmar coleta</h3>
          </div>
          <dl className="kv">
            <dt>Bebê</dt>      <dd><span className="acro">{bebe?.label}</span></dd>
            <dt>Data</dt>      <dd className="mono">{form.dataColeta}</dd>
            <dt>Horário</dt>   <dd className="mono">{form.horarioColeta}</dd>
            <dt>Coletista</dt> <dd>{coletistas.find(c => String(c.id) === form.idColetista)?.label || '—'}</dd>
            <dt>Scanner</dt>   <dd>{scanners.find(s => String(s.id) === form.idScanner)?.label || '—'}</dd>
            <dt>Local</dt>     <dd>{locais.find(l => String(l.id) === form.idLocalColeta)?.label || '—'}</dd>
            <dt>Protocolo</dt> <dd>{protocolos.find(p => String(p.id) === form.idProtocoloColeta)?.label || '—'}</dd>
            {form.observacao && <><dt>Observação</dt><dd>{form.observacao}</dd></>}
          </dl>
          <div className="hstack" style={{ justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn" onClick={() => setStep(1)}>
              <Icon name="chevronLeft" size={14} /> Voltar
            </button>
            <button className="btn btn-primary" disabled={isPending} onClick={handleSave}>
              {isPending ? 'Salvando…' : 'Salvar coleta'}
            </button>
          </div>
        </div>
      )}

      {toastView}
    </div>
  )
}
