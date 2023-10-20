import { Uri, commands, window } from 'vscode'
import type ApiItem from '../core/ApiItem'
import { appSysConfig } from '../core/AppSysConfig'
import { appUserConfig } from '../core/AppUserConfig'
import { apiAdapters } from '../adapters'
import type { MockOptions } from './types'

export class AmsServer {
  /** api列表 */
  amsApiList?: ApiItem[]
  /** 分类列表 */
  amsCatList: any[] = []

  public getProjectID() {
    const { ams, projectID } = appSysConfig.properties

    return appSysConfig.getConfiguration(`${ams}.${projectID}`)
  }

  async refreshData() {
    await appUserConfig.resetAppConfig().catch((err: any) => {
      window.showWarningMessage(err.message || '刷新失败')
    })
  }

  async getCatMenuList() {
    const resData = await appUserConfig.requestCatMenuList()

    const catMenuList = resData.map(res => res?.data || []).flat()

    this.amsCatList = catMenuList
  }

  async getApiLists() {
    const resData = await appUserConfig.requestProjectApiList()

    const apiList = resData.map(res => res?.data || []).flat()

    this.amsApiList = apiList
  }

  async getMockData(opt: MockOptions) {
    const resData = await appUserConfig.requestMockData(opt)

    return resData
  }

  async getApiInfo(apiItem: Yapi.Api.AllApi.Res) {
    const resData = await appUserConfig.requestTargetApi(apiItem)

    const apiResult = apiAdapters(resData)
    return apiResult
  }

  /**
   * 打开pannel初始化api文档信息
  */
  initApiWhenOpen(apiItem: Yapi.Api.AllApi.Res) {
    commands.executeCommand('vscode.open', Uri.parse(appUserConfig.getApiDocUrl(apiItem)))
  }
}

export const amsServer = new AmsServer()
