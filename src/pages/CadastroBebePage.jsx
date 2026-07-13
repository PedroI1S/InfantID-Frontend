import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast.jsx'
import { SearchSelect } from '../components/SearchSelect.jsx'
import { usePostBebe, useSexo, useCheckAcronimo } from '../hooks/useCadastro.js'
import { cadastroApi } from '../api/cadastro.js'

function Field({ label, required: req, children, help }) {
  return (
    <div className="field">
      <label className="field-lbl">{label}{req && <span className="req">*</span>}</label>
      {children}
      {help && <div className="field-help">{help}</div>}
    </div>
  )
}

export function CadastroBebePage() {
  const navigate = useNavigate()
  const [push, toastView] = useToast()

  const [mae, setMae]   = useState(null)
  const [form, setForm] = useState({
    acronimo: '', dataNascimento: '', horarioNascimento: '',
    semanasGestacao: '', idSexo: '', peso: '', altura: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { resultados: sexos }       = useSexo()
  const { mutateAsync: postBebe, isPending } = usePostBebe()
  const { data: checkAcr }          = useCheckAcronimo(form.acronimo)

  const acronimoOk = checkAcr?.disponivel !== false

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mae) { push('Selecione a mãe.', 'danger'); return }
    if (!acronimoOk) { push('Acrônimo já em uso.', 'danger'); return }
    try {
      await postBebe({
        id_responsavel_mae: mae.id,
        acronimo_bebe: form.acronimo.toUpperCase(),
        data_nascimento: form.dataNascimento,
        horario_nascimento: form.horarioNascimento,
        semanas_gestacao: Number(form.semanasGestacao),
        id_sexo: Number(form.idSexo),
        peso: Number(form.peso),
        altura: Number(form.altura),
      })
      push('Bebê cadastrado com sucesso!')
      navigate('/relatorios/bebes')
    } catch (err) {
      push(err.message || 'Erro ao cadastrar.', 'danger')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cadastrar Bebê</h1>
          <p className="page-sub">Vincular a uma mãe já cadastrada.</p>
        </div>
        <div className="hstack">
          <button type="button" className="btn" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3 className="section-title">Mãe responsável</h3>
        </div>
        <Field label="Selecionar mãe" required>
          <SearchSelect
            queryKey={['cadastro', 'maes-select']}
            fetchFn={cadastroApi.getMaes}
            value={mae}
            onChange={setMae}
            placeholder="Buscar mãe por nome…"
          />
        </Field>
      </div>

      <div className="section">
        <div className="section-head">
          <h3 className="section-title">Dados do bebê</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <Field label="Acrônimo" required
            help={form.acronimo.length >= 2 ? (acronimoOk ? '✓ Disponível' : '✗ Já em uso') : ''}>
            <input className="input" value={form.acronimo} required maxLength={10}
              style={{ textTransform: 'uppercase' }}
              onChange={e => set('acronimo', e.target.value)}
              placeholder="Ex: JOS" />
          </Field>
          <Field label="Sexo" required>
            <select className="select" value={form.idSexo} required
              onChange={e => set('idSexo', e.target.value)}>
              <option value="">— selecionar —</option>
              {sexos.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Data de nascimento" required>
            <input className="input" type="date" value={form.dataNascimento} required
              onChange={e => set('dataNascimento', e.target.value)} />
          </Field>
          <Field label="Horário de nascimento" required>
            <input className="input" type="time" value={form.horarioNascimento} required
              onChange={e => set('horarioNascimento', e.target.value)} />
          </Field>
          <Field label="Semanas de gestação" required>
            <input className="input" type="number" value={form.semanasGestacao} required
              min={20} max={45} onChange={e => set('semanasGestacao', e.target.value)} />
          </Field>
          <Field label="Peso (g)" required>
            <input className="input" type="number" value={form.peso} required
              min={200} onChange={e => set('peso', e.target.value)} />
          </Field>
          <Field label="Altura (mm)">
            <input className="input" type="number" value={form.altura}
              onChange={e => set('altura', e.target.value)} />
          </Field>
        </div>
      </div>

      {toastView}
    </form>
  )
}
