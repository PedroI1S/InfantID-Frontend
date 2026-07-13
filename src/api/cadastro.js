import client from './client.js'

const PAGE_SIZE = 20

export const cadastroApi = {
  postResponsavel: (data) =>
    client.post('/cadastro/responsaveis', data).then(r => r.data),

  getMaes: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE } = {}) =>
    client.get('/cadastro/responsavel-mae/', { params: { busca, page, quantidade_por_pagina } }).then(r => {
      const data = r.data
      data.resultados = data.resultados.map(m => ({ id: m.id_responsavel_mae, label: m.nome }))
      return data
    }),

  checkAcronimo: (acronimo) =>
    client.get('/cadastro/check-acronimo/', { params: { acronimo } }).then(r => r.data),

  postBebe: (data) =>
    client.post('/cadastro/', data).then(r => r.data),

  getSexo: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/cadastro/sexo/', { params: { busca, page, quantidade_por_pagina } }).then(r => {
      const data = r.data
      data.resultados = data.resultados.map(s => ({ id: s.id_sexo, label: s.descricao }))
      return data
    }),
}
