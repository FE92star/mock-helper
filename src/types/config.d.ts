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
      /** 代理环境地址 | 同一个环境代理多个域名 */
      target: string | {
        /** 匹配规则 */
        match: string
        /** 代理环境地址 */
        target: string
      }[]
      /** 是否为默认代理环境 */
      default?: boolean | 0 | 1
    }

    interface Json {
      /** 服务信息映射数组 */
      apiMaps?: ApiMapItem[]
      /** Yapi服务地址 */
      baseUrl: string
      /** 代理地址数组 */
      proxy:{
        targets: Target[]
        /** 端口号 */
        port: number
      }
    }
  }
}
