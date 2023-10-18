import { APP_NAME_PREFIX } from '../adapters'

export function warn(msg: string) {
  return `${APP_NAME_PREFIX}${msg}`
}
