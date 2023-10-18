declare namespace Yapi {
  namespace Config {
    interface ApiMapItem {
      /** 服务下的api前缀 */
      apiPrefix: string | string[]
      /** 服务对应的项目编号 */
      projectId: number | string,
      /** 服务对应的开放api token */
      token: string
    }

    interface Target{
      /** 代理环境名称 */
      name: string
      /** 代理环境地址 */
      target: string
    }

    interface Json {
      /** 服务信息映射数组 */
      apiMap?: ApiMapItem[]
      /** Yapi服务地址 */
      baseUrl: string
      /** 代理地址数组 */
      proxy:{
        targets:Target[]
        port?:string
      }
    }
  }
}
