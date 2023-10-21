import { type ExtensionContext, commands, window } from 'vscode'
import { apiWebview } from './view/ApiWebview'
import ApiCreator from './core/ApiCreator'
import ApiController from './core/ApiController'
import ApiProvider from './view/ApiProvider'
import { APP_NAME_PREFIX, COMMAND_ID_IDENTIFIERS, GLOBAL_APP_IDENTIFIER } from './adapters'
import ApiServer from './core/ApiServer'
import ApiCommand from './core/ApiCommand'
import { appSysConfig } from './core/AppSysConfig'

function registerTargetCommand(name: string, cb: (...args: any[]) => any) {
  commands.registerCommand(name, cb)
}

function getAppCommandsMap(apiCommand: ApiCommand) {
  return {
    [COMMAND_ID_IDENTIFIERS.refresh]: apiCommand.refreshServer,
    [COMMAND_ID_IDENTIFIERS.clear]: apiCommand.clearApiFilters,
    [COMMAND_ID_IDENTIFIERS.search]: apiCommand.addApiFilters,
    [COMMAND_ID_IDENTIFIERS.runServer]: apiCommand.runServer,
    [COMMAND_ID_IDENTIFIERS.stopServer]: apiCommand.stopServer,
    [COMMAND_ID_IDENTIFIERS.download]: apiCommand.downloadApiJson,
    [COMMAND_ID_IDENTIFIERS.openJon]: apiCommand.openJsonInVscode,
    [COMMAND_ID_IDENTIFIERS.copy]: apiCommand.copyApiUrl,
  }
}

export function activate(ctx: ExtensionContext) {
  // eslint-disable-next-line no-console
  console.log(`${APP_NAME_PREFIX}插件启动中...`)

  apiWebview.setContext(ctx)

  // 初始化同步api数据
  const apiCreator = new ApiCreator()
  const apiController = new ApiController(apiCreator)
  apiController.fetchServerApiData()

  // 创建视图
  const apiProvider = new ApiProvider(apiController)
  window.createTreeView(GLOBAL_APP_IDENTIFIER, { treeDataProvider: apiProvider })

  // 注册应用所有的command
  const apiServer = new ApiServer(apiController)
  const apiCommand = new ApiCommand(apiProvider, apiController, apiServer)

  const appCommandsMap = getAppCommandsMap(apiCommand)

  for (const [name, cb] of Object.entries(appCommandsMap))
    registerTargetCommand(appSysConfig.identifierWithDot(name), cb)

  if (!apiController.apiItems.length)
    apiCommand.refreshServer()
}

export function deactivate() {

}
