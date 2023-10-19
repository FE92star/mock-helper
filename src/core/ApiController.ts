import { ProgressLocation, window } from 'vscode'
import type AmsApiItem from '../view/ApiNodeItem'
import { amsServer } from '../services/AmsServer'
import type ApiCreator from './ApiCreator'
import type ApiItem from './ApiItem'

/**
 * api控制器
*/
export default class ApiController {
  private _apiItems: ApiItem[] = []

  constructor(
    private apiCreator: ApiCreator,
    public query = '',
  ) {}

  private filterApiItem(words: string) {
    return this._apiItems.filter(item => item.path?.includes(words))
  }

  get apiItems() {
    if (!this.query)
      return this._apiItems
    return this.filterApiItem(this.query)
  }

  searchApiItem(text: string) {
    if (!text)
      return null

    const apiItemList = this.filterApiItem(text)
    if (apiItemList.length)
      return apiItemList[0]

    return null
  }

  /**
   * 打开目标api对应的json文件
  */
  async openTargetJsonFile(node: AmsApiItem) {
    // 如果文件已创建，则直接打开，否则先创建再打开
    if (this.apiCreator.setApiItem(node.api).isExistApiJsonFile)
      this.apiCreator.openJSONFile(node.api)

    else
      await this.fetchTargetApiInfo(node)
    this.apiCreator.openJSONFile(node.api)
  }

  /**
   * 同步对应的api信息
  */
  fetchTargetApiInfo(node: AmsApiItem) {
    const msg = 'Sync: 同步云端接口信息中...'

    return new Promise((resolve, reject) => {
      window.setStatusBarMessage(
        msg,
        window.withProgress(
          { location: ProgressLocation.Notification, title: msg },
          async () => {
            const { api: { path, method, title } } = node

            try {
              const body = await amsServer.getMockDataList({
                path,
                method,
              })
              const apiNode = {
                ...node.api,
                path,
                json: body,
              }
              // 创建本地Json文件
              this.apiCreator.setApiItem(apiNode).createJsonFile()

              resolve(true)
            }
            catch (error) {
              const apiNode = {
                ...node.api,
                path,
                json: { success: true, code: '000000', desc: '成功' },
              }

              this.apiCreator.setApiItem(apiNode).createJsonFile()

              window.showErrorMessage(
                `${title} 接口为空或不符合JSON格式规范，请联系服务端修复后重试`,
              )

              reject(error)
            }
          },
        ),
      )
    })
  }
}