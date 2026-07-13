import client from './client.js'

const PAGE_SIZE = 20

export const relatoriosApi = {
  getMaes: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'data', dir = 'desc', status = 'ativos' } = {}) =>
    client.get('/relatorios/mae', { params: { busca, page, quantidade_por_pagina, sort, dir, status } }).then(r => r.data),

  getBebes: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'data_cad', dir = 'desc', status = 'ativos' } = {}) =>
    client.get('/relatorios/bebe', { params: { busca, page, quantidade_por_pagina, sort, dir, status } }).then(r => r.data),

  getColetas: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'data', dir = 'desc' } = {}) =>
    client.get('/relatorios/coletas/flutter/', { params: { busca, page, quantidade_por_pagina, sort, dir } }).then(r => r.data),

  getRecoletas: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'data_ideal', dir = 'asc', status = 'todos' } = {}) =>
    client.get('/relatorios/recoletas/flutter/', { params: { busca, page, quantidade_por_pagina, sort, dir, status } }).then(r => r.data),

  getDocumentos: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'bebe', dir = 'asc', status = 'vinculados' } = {}) =>
    client.get('/relatorios/documentos/flutter', { params: { busca, page, quantidade_por_pagina, sort, dir, status } }).then(r => r.data),

  getDocumentosPivot: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE, sort = 'bebe', dir = 'asc', status = 'vinculados' } = {}) =>
    client.get('/relatorios/documentos/flutter/pivot', { params: { busca, page, quantidade_por_pagina, sort, dir, status } }).then(r => r.data),

  getDesvinculados: ({ busca = '', page = 1, quantidade_por_pagina = PAGE_SIZE } = {}) =>
    client.get('/relatorios/desvinculos', { params: { busca, page, quantidade_por_pagina } }).then(r => r.data),
}
