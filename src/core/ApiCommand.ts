import { ProgressLocation, commands, env, window } from 'vscode'
import type ApiProvider from '../view/ApiProvider'
import { COMMAND_SWITCH_PROXY_ID, GLOBAL_APP_CONTEXT, MOCK_CONFIG_NAME } from '../adapters'
import { winError } from '../utils'
import type ApiNodeItem from '../view/ApiNodeItem'
import type ApiController from './ApiController'
import type ApiServer from './ApiServer'
import { appSysConfig } from './AppSysConfig'

/**
 * 统一管理command事件
*/
export default class ApiCommand {
  constructor(
    private apiProvider: ApiProvider,
    private apiController: ApiController,
    private apiServer: ApiServer,
  ) {
    this.onActiveEditorChange()

    // 自动开启插件应用
    const isServerAutoRun = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.autoRun)
    if (isServerAutoRun)
      this.runServer()
  }

  private onActiveEditorChange() {
    this.excuteContextCommand(GLOBAL_APP_CONTEXT.serverEnable, false)
    this.excuteContextCommand(GLOBAL_APP_CONTEXT.filterEnable, false)

    this.apiProvider.refresh()
  }

  private excuteContextCommand(...rest: any[]) {
    commands.executeCommand('setContext', ...rest)
  }

  runServer() {
    window.setStatusBarMessage(
      '正在开启 mock server 服务',
      window.withProgress({ location: ProgressLocation.Notification, title: 'Mock服务运行中...' }, async () => {
        try {
          const serverOptions = await this.apiServer.runProxyServer()
          const { defaultProxyInfo: { name } } = serverOptions || {}
          // 标记当前应用已启动
          this.excuteContextCommand(GLOBAL_APP_CONTEXT.serverEnable, true)
          // 避免重复注册switchProxy command
          const vscodeCommands = await commands.getCommands(true)
          const commandId = appSysConfig.identifierWithDot(COMMAND_SWITCH_PROXY_ID)

          if (!vscodeCommands.includes(commandId)) {
            commands.registerCommand(commandId, () => {
              this.apiServer.switchProxy()
            })
          }

          this.apiServer.updateStatusBar(name, commandId)
        }
        catch (error) {
          winError(`启动应用失败，请检查是否已经启动过应用-${error}`)
        }
      }),
    )
  }

  stopServer() {
    window.setStatusBarMessage(
      '正在开启 mock server 服务',
      window.withProgress({ location: ProgressLocation.Notification, title: 'Mock服务关闭中...' }, async () => {
        await this.apiServer.stopProxyServer()
        // 标记当前应用已关闭
        this.excuteContextCommand(GLOBAL_APP_CONTEXT.serverEnable, false)
        // 关闭进度条
        this.apiServer.updateStatusBar()
      }),
    )
  }

  refreshServer() {
    window.withProgress({ location: ProgressLocation.Notification, title: '正在同步接口列表中...' }, async () => {
      await this.apiController.fetchServerApiData()
      this.apiProvider.refresh()
    })
  }

  /**
   * 下载api信息并创建本地json文件
  */
  downloadApiJson(node: ApiNodeItem) {
    this.apiController.fetchTargetApiInfo(node)
  }

  openJsonInVscode(node: ApiNodeItem) {
    this.apiController.openTargetJsonFile(node)
  }

  openApiInBrowser(node: ApiNodeItem) {
    this.apiController.openApiInBrowser(node)
  }

  /**
   * 清空api搜索项
  */
  clearApiFilters() {
    this.apiController.query = ''
    // 标记搜索状态关闭
    this.excuteContextCommand(GLOBAL_APP_CONTEXT.filterEnable, false)
    this.apiProvider.refresh()
  }

  /**
   * 搜索api
  */
  async addApiFilters() {
    const queryValue = await window.showInputBox({
      placeHolder: '请输入路径筛选',
      // value和query双向绑定
      value: this.apiController.query,
      valueSelection: [0, this.apiController.query.length],
    })
    // 标记搜索状态开启
    this.excuteContextCommand(GLOBAL_APP_CONTEXT.filterEnable, !!queryValue)

    if (queryValue !== undefined) {
      this.apiController.query = queryValue
      this.apiProvider.refresh()
    }
  }

  /**
   * 复制api地址
  */
  copyApiUrl(node: ApiNodeItem) {
    env.clipboard.writeText(node.description)
  }
}
