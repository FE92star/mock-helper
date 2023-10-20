/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import { window } from 'vscode'
import * as rp from 'request-promise-native'
import { warn } from '../utils'
import { YAPI_LIMIT_DATA, YAPI_OEPNAPI_BASEURL, YAPI_OEPNAPI_LIST_MAP } from '../services/YapiOpenApi'
import type { MockOptions } from '../services/types'
import { appSysConfig } from './AppSysConfig'

/**
 * 插件用户配置相关(mock.config.json)
*/
export default class AppUserConfig {
  config: Yapi.Config.Json = this.getAppConfig()
  /** request-promise实例 */
  rpIns = this.createRpIns()

  constructor() {
    this.config = this.getAppConfig()
  }

  private createRpIns() {
    return rp.defaults({
      baseUrl: this.config.baseUrl,
      json: true,
    })
  }

  public getAppConfig() {
    const { configPath: appConfigPath } = appSysConfig.properties

    const configPath = appSysConfig.getConfiguration(appConfigPath)

    if (!fs.existsSync(configPath))
      this.createConfigFile(configPath)

    try {
      // 删除require的缓存
      if (require.cache[configPath])
        delete require.cache[configPath]
      // require读取js配置文件
      const appConfig = require(configPath)
      return appConfig
    }
    catch (error) {
      window.showErrorMessage(`${warn('读取配置文件失败')}`)
      return null
    }
  }

  private createConfigFile(path: string) {
    const configData = require('../../template/mock.config.json')

    // 写入默认配置文件
    fs.writeFileSync(path, JSON.stringify(configData), { encoding: 'utf-8' })
  }

  /**
   * 校验配置文件是否合法
  */
  private validateAppConfig(configJson: Yapi.Config.Json) {
    if (!configJson)
      throw new Error(`${warn('启动本插件前请先在项目根目录下创建mock.config.json')}`)

    const isEmptyKey = Object.values(configJson).some(v => !v)
    if (isEmptyKey)
      throw new Error(warn('请完善配置文件的相关字段'))

    return Promise.resolve()
  }

  public async resetAppConfig() {
    const conf = this.getAppConfig()

    await this.validateAppConfig(conf).catch(() => {
      window.showWarningMessage(warn('请完善配置文件的相关字段'))
    })
  }

  /**
   * 获取apiMap字段
  */
  get getAppApiMap() {
    return this.config.apiMaps || []
  }

  /**
   * 获取api文档地址
  */
  getApiDocUrl(apiItem: Yapi.Api.AllApi.Res) {
    const { baseUrl } = this.config
    const { _id, project_id } = apiItem

    return `${baseUrl}/project/${project_id}/interface/api/${_id}`
  }

  /**
   * 获取对应路径的api配置信息
   */
  getApiConfigByPath(path: string) {
    if (!this.getAppApiMap.length)
      throw new Error(warn('同步失败'))

    return this.getAppApiMap.find((item) => {
      const { apiPrefix } = item

      if (Array.isArray(apiPrefix))
        return apiPrefix.some(v => path.startsWith(v))

      return path.startsWith(apiPrefix)
    })
  }

  /** 获取项目下所有的api */
  requestProjectApi({ token }: Yapi.Config.ApiMapItem) {
    const apiUrl = YAPI_OEPNAPI_LIST_MAP.apiList.url

    return this.rpIns({
      url: `${YAPI_OEPNAPI_BASEURL}${apiUrl}?token=${token}&limit=${YAPI_LIMIT_DATA}`,
    })
  }

  /** 获取菜单列表 */
  requestCatMenu({ token }: Yapi.Config.ApiMapItem) {
    const apiUrl = YAPI_OEPNAPI_BASEURL + YAPI_OEPNAPI_LIST_MAP.catMenu.url

    return this.rpIns({
      url: `${apiUrl}?token=${token}`,
    })
  }

  /**
   * 获取所有分类列表
  */
  public requestCatMenuList() {
    return this.requestApiList(this.requestCatMenu)
  }

  /**
   * 获取项目所有api
  */
  public requestProjectApiList() {
    return this.requestApiList(this.requestProjectApi)
  }

  /**
   * 获取目标api信息
  */
  public requestTargetApi({ path, _id }: Yapi.Api.AllApi.Res) {
    const apiUrl = YAPI_OEPNAPI_BASEURL + YAPI_OEPNAPI_LIST_MAP.apiGet.url
    const apiConfig = this.getApiConfigByPath(path)

    if (!apiConfig)
      return Promise.reject(new Error(warn('请完善配置文件信息')))

    const { token } = apiConfig

    return this.rpIns({
      url: `${apiUrl}?token=${token}&id=${_id}`,
    })
  }

  /**
   * 获取平台的Mock数据
  */
  public requestMockData(option: MockOptions) {
    const { path, method } = option
    const { baseUrl } = this.config
    const apiConfig = this.getApiConfigByPath(path)

    if (!apiConfig) {
      window.showErrorMessage(warn('请完善配置文件信息'))
      return
    }

    return this.rpIns({
      baseUrl: `${baseUrl}/mock/${apiConfig.projectId}`,
      uri: path,
      method: method.toLocaleUpperCase(),
    })
  }

  private requestApiList(request: (item: Yapi.Config.ApiMapItem) => rp.RequestPromise<any>) {
    const apiMapData = this.getAppApiMap

    if (!apiMapData.length)
      return Promise.reject(new Error(warn('同步失败')))

    return Promise.all(apiMapData.map(item => request(item)))
  }
}

export const appUserConfig = new AppUserConfig()
