import client from './client.js'

const PAGE_SIZE = 20

function normalize(data, idKey, labelKey) {
  return {
    ...data,
    resultados: (data.resultados ?? []).map(r => ({ id: r[idKey], label: r[labelKey] })),
  }
}

export const coletaApi = {
  postColeta: (data) =>
    client.post('/coleta/', data).then(r => r.data),

  getAcronimos: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE } = {}) =>
    client.get('/coleta/acronimo/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_cadastro_bebe', 'acronimo_bebe')),

  getColetistas: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/coleta/coletista/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_coletista', 'nome')),

  getScanners: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/coleta/scanner/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_scanner', 'nome')),

  getLocaisColeta: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/coleta/local-coleta/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_local_coleta', 'descricao')),

  getProcedimentos: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/coleta/procedimento-limpeza/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_procedimento_limpeza', 'descricao')),

  getProtocolos: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/coleta/protocolo/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_protocolo', 'nome')),
}
