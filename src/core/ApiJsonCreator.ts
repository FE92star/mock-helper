import path from 'node:path'
import { Uri, window } from 'vscode'
import { MOCK_CONFIG_NAME, pathAdapters } from '../adapters'
import type ApiItem from './ApiItem'
import { appSysConfig } from './AppSysConfig'

export default class ApiJsonCreator {
  private apiItem: ApiItem | undefined

  setApiItem(api: ApiItem) {
    this.apiItem = api
    return this
  }

  /**
   * 打开对应api的本地JSON文件
  */
  openJSONFile(api: ApiItem) {
    const apiPath = this.setApiItem(api).getApiProjectPath()

    const previewFields = appSysConfig.getConfiguration(appSysConfig.properties.preview)

    // 打开展示一个文本文件
    window.showTextDocument(Uri.file(apiPath), { preview: previewFields })
  }

  getApiProjectPath() {
    if (!this.apiItem)
      throw new Error('请先设置URL')

    const { path: apiPath } = this.apiItem

    // mock文件夹的目录地址
    const mockJsonDir = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.rootDir)
    // 适配windows系统
    const lastApiPath = apiPath.startsWith('/') ? `/${apiPath}` : apiPath

    const apiProjectPath = pathAdapters(
      path.join(mockJsonDir, `${lastApiPath}.json`),
    )

    return apiProjectPath
  }
}
