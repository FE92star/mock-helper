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

export * from './config'
