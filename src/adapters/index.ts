import path from 'node:path'

export function apiAdapters(data: { res_body: any & Record<string, any> }) {
  return {
    ...data,
    response: JSON.parse(data.res_body) || {},
  }
}

export function pathAdapters(name: string) {
  return name.replace('/', path.sep)
}

export function urlAdapters(url: string) {
  let newUrl = url

  if (url.includes('$'))
    newUrl = url.replace(/\$/g, ':').replace(/\{|\}/g, '')

  if (url.includes('?'))
    newUrl = url.replace(/(.+)(\?.+)/g, '$1')

  if (!url.startsWith('/'))
    newUrl = `/${url}`

  return newUrl
}

export function yapiMockDataAdapters(data: any) {
  return JSON.stringify({
    code: data.code || '000000',
    success: data.success === null ? false : data.success,
    data: data.data,
  }, null, 2)
}

export * from './config'
