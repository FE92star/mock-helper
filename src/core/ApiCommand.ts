import { commands, window } from 'vscode'
import type AmsProvider from '../view/AmsProvider'
import { GLOBAL_APP_CONTEXT } from '../adapters'
import type ApiController from './ApiController'
import type ApiServer from './ApiServer'

/**
 * 统一管理command事件
*/
export default class ApiCommand {
  constructor(
    private amsProvider: AmsProvider,
    private apiController: ApiController,
    private apiServer: ApiServer,
  ) {
    this.onActiveEditorChange()
  }

  private onActiveEditorChange() {
    commands.executeCommand('setContext', GLOBAL_APP_CONTEXT.serverEnable, false)
    commands.executeCommand('setContext', GLOBAL_APP_CONTEXT.filterEnable, false)

    this.amsProvider.refresh()
  }

  runServer() {
    window.setStatusBarMessage(
      '正在开启 mock server 服务',
    )
  }
}
