import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast.jsx'
import { SearchSelect } from '../components/SearchSelect.jsx'
import { Modal } from '../components/Modal.jsx'
import { usePostDesvinculo } from '../hooks/useDesvinculo.js'
import { coletaApi } from '../api/coleta.js'

const MOTIVOS = [
  'Recusa familiar',
  'Mudança de cidade',
  'Óbito infantil',
  'Perda de contato',
  'Outro',
]

function Field({ label, required: req, children }) {
  return (
    <div className="field">
      <label className="field-lbl">{label}{req && <span className="req">*</span>}</label>
      {children}
    </div>
  )
}

export function DesvinculoPage() {
  const navigate = useNavigate()
  const [push, toastView] = useToast()

  const [bebe, setBebe]         = useState(null)
  const [motivo, setMotivo]     = useState(MOTIVOS[0])
  const [data, setData]         = useState(new Date().toISOString().slice(0, 10))
  const [observacao, setObs]    = useState('')
  const [confirm, setConfirm]   = useState(false)

  const { mutateAsync: postDesvinculo, isPending } = usePostDesvinculo()

  async function handleConfirm() {
    try {
      await postDesvinculo({
        id_cadastro_bebe: bebe.id,
        tipo_desvinculo: motivo,
        data,
        observacao,
      })
      push('Bebê desvinculado.')
      setConfirm(false)
      setBebe(null)
      setObs('')
      navigate('/relatorios/bebes')
    } catch (err) {
      push(err.message || 'Erro ao desvincular.', 'danger')
      setConfirm(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Desvínculo</h1>
          <p className="page-sub">Remover bebê do programa, mantendo histórico.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3 className="section-title">Bebê a desvincular</h3>
        </div>

        <Field label="Bebê (acrônimo)" required>
          <SearchSelect
            queryKey={['coleta', 'acronimos-desvinculo']}
            fetchFn={coletaApi.getAcronimos}
            value={bebe}
            onChange={setBebe}
            placeholder="Buscar por acrônimo…"
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <Field label="Motivo" required>
            <select className="select" value={motivo} onChange={e => setMotivo(e.target.value)}>
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Data" required>
            <input type="date" className="input" value={data}
              onChange={e => setData(e.target.value)} />
          </Field>
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Observações">
              <textarea className="textarea" value={observacao}
                onChange={e => setObs(e.target.value)}
                placeholder="Descreva o contexto do desvínculo…" />
            </Field>
          </div>
        </div>

        <div className="hstack" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-danger"
            disabled={!bebe}
            onClick={() => setConfirm(true)}
          >
            Desvincular
          </button>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Confirmar desvínculo"
        sub="Esta ação é permanente e não pode ser desfeita."
        footer={
          <>
            <button className="btn" onClick={() => setConfirm(false)}>Cancelar</button>
            <button className="btn btn-danger" disabled={isPending} onClick={handleConfirm}>
              {isPending ? 'Processando…' : 'Confirmar desvínculo'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 13.5, margin: 0 }}>
          O bebê <b>{bebe?.label}</b> será removido do programa com motivo <b>"{motivo}"</b>.
          O histórico de coletas e recoletas será mantido.
        </p>
      </Modal>

      {toastView}
    </div>
  )
}
