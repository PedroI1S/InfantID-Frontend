// Modo demonstração: responde os endpoints com dados de exemplo, sem backend.
// Ativado com VITE_DEMO=true (usado no build do GitHub Pages).

export const DEMO = import.meta.env.VITE_DEMO === 'true'

const MAES = [
  {
    id_mae: 1, mae: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com',
    telefone: '(46) 99999-0001', cidade: 'Pato Branco', estado: 'PR',
    rua: 'Rua das Araucárias, 120', bairro: 'Centro', data: '02/03/2026',
  },
  {
    id_mae: 2, mae: 'Ana Souza', email: 'ana.souza@exemplo.com',
    telefone: '(46) 99999-0002', cidade: 'Cascavel', estado: 'PR',
    rua: 'Av. Brasil, 450', bairro: 'São Cristóvão', data: '18/05/2026',
  },
]

const BEBES = [
  {
    id_bebe: 1, bebe: 'MO01', mae: 'Maria Oliveira', sexo: 'F',
    data_nasc: '01/03/2026', hora: '08:42', peso: '3.120', altura: '48.5',
    semana_gest: '39', data_cad: '02/03/2026',
  },
  {
    id_bebe: 2, bebe: 'AS01', mae: 'Ana Souza', sexo: 'M',
    data_nasc: '17/05/2026', hora: '14:10', peso: '3.480', altura: '50.0',
    semana_gest: '40', data_cad: '18/05/2026',
  },
]

const COLETAS = [
  {
    id_coleta: 1, bebe: 'MO01', mae: 'Maria Oliveira', coletista: 'Coletista Demo',
    data: '02/03/2026', hora: '09:15', local: 'Hospital Municipal',
    scanner: 'DactyScan 84c', observacao: 'Coleta realizada sem intercorrências.',
  },
  {
    id_coleta: 2, bebe: 'AS01', mae: 'Ana Souza', coletista: 'Coletista Demo',
    data: '18/05/2026', hora: '15:00', local: 'Hospital Municipal',
    scanner: 'DactyScan 84c', observacao: '',
  },
]

const RECOLETAS = [
  {
    id_recoleta: 1, bebe: 'MO01', mae: 'Maria Oliveira', tipo: '3 meses',
    data_ideal: '01/06/2026', data_recoleta: '03/06/2026',
    observacao: 'Recoleta concluída dentro do prazo.',
  },
  {
    id_recoleta: 2, bebe: 'AS01', mae: 'Ana Souza', tipo: '3 meses',
    data_ideal: '17/08/2026', data_recoleta: null,
    observacao: '',
  },
]

const TIPOS_DOCUMENTO = [
  { id_tipo_documento: 1, descricao: 'Certidão de Nascimento' },
  { id_tipo_documento: 2, descricao: 'CPF' },
]

const DOCUMENTOS = [
  {
    id_bebe: 1, bebe: 'MO01', mae: 'Maria Oliveira',
    id_tipo_documento: 1, tipo: 'Certidão de Nascimento', status: true, data: '05/03/2026',
  },
  {
    id_bebe: 2, bebe: 'AS01', mae: 'Ana Souza',
    id_tipo_documento: 2, tipo: 'CPF', status: false, data: null,
  },
]

const DOCUMENTOS_PIVOT = [
  {
    id_bebe: 1, bebe: 'MO01', mae: 'Maria Oliveira',
    documentos: {
      'Certidão de Nascimento': { status: true, data: '05/03/2026' },
      'CPF':                    { status: true, data: '12/03/2026' },
    },
  },
  {
    id_bebe: 2, bebe: 'AS01', mae: 'Ana Souza',
    documentos: {
      'Certidão de Nascimento': { status: true, data: '20/05/2026' },
      'CPF':                    { status: false, data: null },
    },
  },
]

const paginado = resultados => ({ resultados, quantidade: resultados.length, pagina_atual: 1 })

const GET_ROUTES = [
  [/^\/relatorios\/mae\/?$/,                       () => paginado(MAES)],
  [/^\/relatorios\/bebe\/?$/,                      () => paginado(BEBES)],
  [/^\/relatorios\/coletas\/flutter\/?$/,          () => paginado(COLETAS)],
  [/^\/relatorios\/recoletas\/flutter\/?$/,        () => paginado(RECOLETAS)],
  [/^\/relatorios\/documentos\/flutter\/pivot\/?$/, () => paginado(DOCUMENTOS_PIVOT)],
  [/^\/relatorios\/documentos\/flutter\/?$/,       () => paginado(DOCUMENTOS)],
  [/^\/relatorios\/desvinculos\/?$/,               () => paginado([])],
  [/^\/documentos\/tipos\/?$/,                     () => ({ tipos: TIPOS_DOCUMENTO })],
]

export function demoAdapter(config) {
  const url = (config.url || '').split('?')[0]
  const method = (config.method || 'get').toLowerCase()

  const route = method === 'get' && GET_ROUTES.find(([re]) => re.test(url))
  if (route) {
    return Promise.resolve({
      data: route[1](), status: 200, statusText: 'OK', headers: {}, config,
    })
  }

  return Promise.reject({
    response: {
      data: { message: 'Modo demonstração: apenas leitura de dados de exemplo.' },
      status: 403, statusText: 'Forbidden', headers: {}, config,
    },
    config,
    message: 'Modo demonstração: apenas leitura de dados de exemplo.',
  })
}
