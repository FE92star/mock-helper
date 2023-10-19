import path from 'node:path'
import fs from 'node:fs'
import { Uri, window } from 'vscode'
import { MOCK_CONFIG_NAME, pathAdapters } from '../adapters'
import { readJsonFile, writeJsonFile } from '../utils'
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
   * mock文件夹的目录地址
  */
  get mockJsonDir() {
    return appSysConfig.getConfiguration(MOCK_CONFIG_NAME.rootDir)
  }

  /**
   * 更新json信息
  */
  private async updateJsonFile() {
    if (!this.apiItem)
      return

    const apiJsonPath = this.getApiJsonPath()
    if (!fs.existsSync(apiJsonPath))
      return
    const oldJsonBodyStr = await readJsonFile(apiJsonPath).catch((e) => {
      window.showErrorMessage(`读取 ${e} 文件失败，请检查`)
    })
    const oldJsonBody = oldJsonBodyStr ? JSON.parse(oldJsonBodyStr) : {}

    // TODO: 需要处理Json字段合并的问题
    const jsonBody = Object.assign(oldJsonBody, this.apiItem.json)

    writeJsonFile(apiJsonPath, jsonBody)
  }

  /**
   * 创建本地mock json文件
  */
  public createJsonFile() {
    if (!this.apiItem)
      return

    // 不存在则创建
    if (!fs.existsSync(this.mockJsonDir))
      fs.mkdirSync(this.mockJsonDir)

    let apiUrl = this.apiItem.path
    if (!apiUrl.startsWith('/'))
      apiUrl = `/${apiUrl}`

    // api所在的目录
    const apiDir = pathAdapters(this.mockJsonDir + path.dirname(apiUrl))

    if (!fs.existsSync(apiDir))
      fs.mkdirSync(apiDir, { recursive: true })

    const apiPath = this.getApiJsonPath()
    // 文件存在则更新、否则创建再写入
    if (fs.existsSync(apiPath))
      this.updateJsonFile()
    else
      writeJsonFile(apiPath, this.apiItem.json)
  }

  getApiJsonPath() {
    if (!this.apiItem)
      throw new Error('请先设置URL')

    const { path: apiPath } = this.apiItem
    // 兼容windows系统
    const lastApiPath = apiPath.startsWith('/') ? `/${apiPath}` : apiPath

    const apiProjectPath = pathAdapters(
      path.join(this.mockJsonDir, `${lastApiPath}.json`),
    )

    return apiProjectPath
  }

  get isExistApiJsonFile() {
    if (!this.apiItem)
      return false

    return fs.existsSync(this.getApiJsonPath())
  }
}
