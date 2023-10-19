import path from 'node:path'
import fs from 'node:fs'
import { Uri, window } from 'vscode'
import { MOCK_CONFIG_NAME, pathAdapters } from '../adapters'
import type ApiItem from './ApiItem'
import { appSysConfig } from './AppSysConfig'

/**
 * 单个api构造器
*/
export default class ApiCreator {
  private apiItem: ApiItem | undefined

  setApiItem(api: ApiItem) {
    this.apiItem = api
    return this
  }

  /**
   * 打开对应api的本地JSON文件
  */
  openJSONFile(api: ApiItem) {
    const apiPath = this.setApiItem(api).getApiJsonPath()

    const previewFields = appSysConfig.getConfiguration(appSysConfig.properties.preview)

    // 打开展示一个文本文件
    window.showTextDocument(Uri.file(apiPath), { preview: previewFields })
  }

  /**
   * json写入信息
  */
  private writeJsonFile(file: string, json: any) {
    try {
      fs.writeFileSync(file, JSON.stringify(json, null, 2), {
        encoding: 'utf-8',
      })
    }
    catch (error) {
      window.showErrorMessage(`写入 ${file} 文件失败，请检查`)
    }
  }

  /**
   * 读取json信息
  */
  private readJsonFile(file: string) {
    try {
      return fs.readFileSync(file, { encoding: 'utf-8' })
    }
    catch (error) {
      window.showErrorMessage(`读取 ${file} 文件失败，请检查`)
    }
  }

  /**
   * 更新json信息
  */
  private updateJsonFile() {
    if (!this.apiItem)
      return

    const apiJsonPath = this.getApiJsonPath()
    if (!fs.existsSync(apiJsonPath))
      return
    const oldJsonBodyStr = this.readJsonFile(apiJsonPath)
    const oldJsonBody = oldJsonBodyStr ? JSON.parse(oldJsonBodyStr) : {}

    // TODO: 需要处理Json字段合并的问题
    const jsonBody = Object.assign(oldJsonBody, this.apiItem.json)

    this.writeJsonFile(apiJsonPath, jsonBody)
  }

  getApiJsonPath() {
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

  get isExistApiJsonFile() {
    if (!this.apiItem)
      return false

    return fs.existsSync(this.getApiJsonPath())
  }
}
