import client from './client.js'

const PAGE_SIZE = 20

function normalize(data, idKey, labelKey) {
  return {
    ...data,
    resultados: (data.resultados ?? []).map(r => ({ id: r[idKey], label: r[labelKey] })),
  }
}

export const recoletaApi = {
  postRecoleta: (data) =>
    client.post('/recoleta/', data).then(r => r.data),

  getRecoletas: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE } = {}) =>
    client.get('/recoleta/', { params: { busca, page, quantidade_por_pagina } }).then(r => r.data),

  getNascimentoBebe: (id_bebe) =>
    client.get('/recoleta/buscar_nascimento_bebe/', { params: { id_bebe } }).then(r => r.data),

  getTiposRecoleta: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/recoleta/tipo-recoleta/', { params: { busca, page, quantidade_por_pagina } })
      .then(r => normalize(r.data, 'id_tipo_recoleta', 'descricao')),
}
