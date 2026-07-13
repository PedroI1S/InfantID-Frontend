import client, { withAdminHeader } from './client.js'

export const documentosApi = {
  getTipos: () =>
    client.get('/documentos/tipos/').then(r =>
      (r.data.tipos ?? []).map(t => ({ ...t, id: t.id_tipo_documento }))
    ),

  postTipo: (data, password) =>
    client.post('/documentos/tipos/', data, withAdminHeader(password)).then(r => r.data),

  deleteTipo: (id, password) =>
    client.delete(`/documentos/tipos/${id}/`, withAdminHeader(password)).then(r => r.data),

  postImportar: (password) =>
    client.post('/documentos/importar/', {}, withAdminHeader(password)).then(r => r.data),
}
