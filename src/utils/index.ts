import { window } from 'vscode'
import { APP_NAME_PREFIX } from '../adapters'

export function prefixingMsg(msg: string) {
  return `${APP_NAME_PREFIX}${msg}`
}

export function winError(msg: string) {
  return window.showErrorMessage(prefixingMsg(msg))
}

export function winWarn(msg: string) {
  return window.showWarningMessage(prefixingMsg(msg))
}

export function winConsole(msg: string) {
  return window.showInformationMessage(prefixingMsg(msg))
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const monthNum = date.getMonth() + 1
  const month = monthNum > 9 ? monthNum : `0${monthNum}`
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`

  return `${year}-${month}-${day}`
}

export * from './file'
