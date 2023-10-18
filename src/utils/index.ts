export const APP_PREFIX = '[MOCK小助手]'

export function sendAppMes(msg: string) {
  return `${APP_PREFIX}${msg}`
}
