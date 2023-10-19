import { APP_NAME_PREFIX } from '../adapters'

export function warn(msg: string) {
  return `${APP_NAME_PREFIX}${msg}`
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const monthNum = date.getMonth() + 1
  const month = monthNum > 9 ? monthNum : `0${monthNum}`
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`

  return `${year}-${month}-${day}`
}
