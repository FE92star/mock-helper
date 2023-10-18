export function apiAdapters(data: { res_body: any; [key: string]: any }) {
  return {
    ...data,
    response: JSON.parse(data.res_body) || {},
  }
}
