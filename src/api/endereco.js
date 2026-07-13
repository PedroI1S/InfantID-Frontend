import client from './client.js'

export const enderecoApi = {
  getEstados: ({ busca = '', page = 1, quantidade_por_pagina = 100 } = {}) =>
    client.get('/endereco/buscar-estados/', { params: { busca, page, quantidade_por_pagina } }).then(r => r.data),

  getCidades: ({ id_estado, busca = '', page = 1, quantidade_por_pagina = 200 } = {}) =>
    client.get('/endereco/buscar-cidades/', { params: { id_estado, busca, page, quantidade_por_pagina } }).then(r => r.data),

  getBairros: ({ id_cidade, busca = '', page = 1, quantidade_por_pagina = 200 } = {}) =>
    client.get('/endereco/buscar-bairros/', { params: { id_cidade, busca, page, quantidade_por_pagina } }).then(r => r.data),

  getRuas: ({ id_bairro, busca = '', page = 1, quantidade_por_pagina = 200 } = {}) =>
    client.get('/endereco/buscar-ruas/', { params: { id_bairro, busca, page, quantidade_por_pagina } }).then(r => r.data),

  getByCep: (cep) =>
    import('cep-promise').then(m => (m.default || m)(cep.replace(/\D/g, ''))),
}
