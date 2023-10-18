export function apiAdapters(data: { res_body: any & Record<string, any> }) {
  return {
    ...data,
    response: JSON.parse(data.res_body) || {},
  }
}
