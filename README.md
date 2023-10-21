# mock-helper
* 基于yapi平台，一键启动mock服务的vscode插件

<a href="https://marketplace.visualstudio.com/items?itemName=fe92star.yapi-mock-server" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/fe92star.yapi-mock-server.svg?color=blue&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>


## 启动和发布
```bash
nr dev
nr release
```

## TODO

- [ ] 自动生成api的类型信息并创建打开vscode webview

## 插件功能点

1. 通过项目本地`mock.config.json`实现代理信息可配置化
2. 自动创建接口本地`mock*/.json`文件，实现本地数据的mock，也支持`.js`文件
3. 自由切换mock数据源

## 配置文件类型定义

```ts
interface MockConfigJSON {
  /** 服务信息映射数组 */
  apiMaps?: ApiMapItem[]
  /** Yapi服务地址 */
  baseUrl: string
  /** 代理地址数组 */
  proxy: {
    /** 代理目标地址 */
    targets: Target[]
    /** 端口号 */
    port: number
  }
}

interface ApiMapItem {
  /** 服务下的api前缀 */
  apiPrefix: string | string[]
  /** 服务对应的项目编号 */
  projectId: number | string
  /** 服务对应的开放api token */
  token: string
}

interface Target {
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
```

## 注意

* 项目代理`proxy`的相关配置，需要用户根据项目的实际情况进行配置，即本插件只是在本地运行了一个`http`服务器拦截所有的请求，用户的项目需要配置`proxy`到这个服务器的地址来，才能完成整个代理流程。

```js
// port即是mock.config.json配置的proxy.port，默认10086
proxy.target = `http://127.0.0.1:${port}` || `http://localhost:${port}`
```


## 参考资料

1. [vscode插件官方开发文档](https://code.visualstudio.com/api)
2. [yapi开放API文档](https://hellosean1025.github.io/yapi/openapi.html)
