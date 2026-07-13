import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast.jsx'
import { useCep } from '../hooks/useEndereco.js'
import { usePostResponsavel } from '../hooks/useCadastro.js'

function Field({ label, required: req, children, help }) {
  return (
    <div className="field">
      <label className="field-lbl">
        {label}{req && <span className="req">*</span>}
      </label>
      {children}
      {help && <div className="field-help">{help}</div>}
    </div>
  )
}

export function CadastroMaePage() {
  const navigate = useNavigate()
  const [push, toastView] = useToast()

  const [form, setForm] = useState({
    nome: '', cpf: '', rg: '',
    telefone: '', email: '',
    cep: '', numero: '', complemento: '',
    estado: '', cidade: '', bairro: '', logradouro: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: cepData } = useCep(form.cep)
  const { mutateAsync: postResponsavel, isPending } = usePostResponsavel()

  // Auto-fill address fields when CEP resolves
  useEffect(() => {
    if (!cepData || cepData.erro) return
    setForm(f => ({
      ...f,
      estado:     cepData.state        ?? cepData.uf          ?? f.estado,
      cidade:     cepData.city         ?? cepData.localidade  ?? f.cidade,
      bairro:     cepData.neighborhood ?? cepData.bairro      ?? f.bairro,
      logradouro: cepData.street       ?? cepData.logradouro  ?? f.logradouro,
    }))
  }, [cepData])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.estado || !form.cidade || !form.bairro || !form.logradouro) {
      push('Preencha o endereço completo (Estado, Cidade, Bairro e Logradouro).', 'danger')
      return
    }
    try {
      await postResponsavel({
        nome:           form.nome,
        cpf:            form.cpf || null,
        rg:             form.rg || null,
        telefone:       form.telefone || null,
        email:          form.email || null,
        sigla_estado:   form.estado.trim().toUpperCase(),
        nome_cidade:    form.cidade.trim(),
        nome_bairro:    form.bairro.trim(),
        nome_logradouro: form.logradouro.trim(),
        numero:         form.numero ? Number(form.numero) : null,
        complemento:    form.complemento || null,
      })
      push('Mãe cadastrada com sucesso!')
      navigate('/relatorios/maes')
    } catch (err) {
      push(err.message || 'Erro ao cadastrar.', 'danger')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cadastrar Mãe</h1>
          <p className="page-sub">Identificação, endereço e contato.</p>
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
          <div>
            <h3 className="section-title">Identificação</h3>
            <p className="section-sub">CPF ou RG é obrigatório.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: 'span 3' }}>
            <Field label="Nome completo" required>
              <input className="input" value={form.nome} required
                onChange={e => set('nome', e.target.value)} />
            </Field>
          </div>
          <Field label="CPF">
            <input className="input" value={form.cpf} placeholder="000.000.000-00"
              onChange={e => set('cpf', e.target.value)} />
          </Field>
          <Field label="RG">
            <input className="input" value={form.rg}
              onChange={e => set('rg', e.target.value)} />
          </Field>
          <Field label="Data de nascimento">
            <input className="input" type="date" />
          </Field>
          <Field label="Telefone">
            <input className="input" value={form.telefone} placeholder="(41) 99999-9999"
              onChange={e => set('telefone', e.target.value)} />
          </Field>
          <Field label="E-mail">
            <input className="input" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3 className="section-title">Endereço</h3>
          <p className="section-sub" style={{ marginTop: 2 }}>
            Digite o CEP para preencher automaticamente.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Field label="CEP" required>
            <input className="input" value={form.cep} placeholder="00000-000" required
              onChange={e => set('cep', e.target.value)} />
          </Field>
          <Field label="Estado" required>
            <input className="input" value={form.estado} placeholder="PR" maxLength={2}
              onChange={e => set('estado', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Cidade" required>
            <input className="input" value={form.cidade} placeholder="Nome da cidade"
              onChange={e => set('cidade', e.target.value)} />
          </Field>
          <Field label="Bairro" required>
            <input className="input" value={form.bairro} placeholder="Nome do bairro"
              onChange={e => set('bairro', e.target.value)} />
          </Field>
          <Field label="Logradouro (rua)" required>
            <input className="input" value={form.logradouro} placeholder="Nome da rua"
              onChange={e => set('logradouro', e.target.value)} />
          </Field>
          <Field label="Número">
            <input className="input" value={form.numero} type="number"
              onChange={e => set('numero', e.target.value)} />
          </Field>
          <Field label="Complemento">
            <input className="input" value={form.complemento} placeholder="Apto, bloco…"
              onChange={e => set('complemento', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3 className="section-title">Consentimento</h3>
        </div>
        <label className="hstack" style={{ gap: 12, padding: 14, background: 'var(--surface-2)', borderRadius: 8, cursor: 'pointer' }}>
          <input type="checkbox" required />
          <span style={{ fontSize: 13.5 }}>
            Confirmo que a mãe assinou o termo de consentimento livre e esclarecido.
          </span>
        </label>
      </div>

      {toastView}
    </form>
  )
}
