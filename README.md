# mock-helper
* 基于yapi平台，一键启动mock服务的vscode插件

<a href="https://marketplace.visualstudio.com/items?itemName=fe92star.yapi-mock-server" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/fe92star.yapi-mock-server.svg?color=blue&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>

## 插件功能点

1. 一键快速启动mock服务，自由切换mock代理源
1. 提供项目自定义`mock.config.json`配置，实现定制化配置
2. 自动创建接口本地`mock*/.json`文件，实现本地数据的mock，也支持`.js`文件
3. 实时同步yapi平台部署的接口信息，无需手动更新

## 可支持的代理模式

1. 自定义代理地址——使用自定义的服务IP地址
2. MOCK缓存模式——直接代理到项目的本地mock/*文件地址
3. 直连YAPI模式——直接代理到YAPI平台的mock数据地址
4. 用户配置代理模式——读取用户配置`mock.config.json`的`proxy.targets`字段中的`target`对应的地址

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

## 系统配置字段

* 即可以通过`vscode`的`全局设置`来完成系统配置，表格中的`workspaceFolder`表示工作区的目录，即项目的根目录。

|名称|类型|默认值|备注|
|-|-|-|-|
|mockHelper.mock.rootDir|String|`${workspaceFolder}/mock`|mock 文件自动生成的根目录|
|mockHelper.mock.port|Number|10086|mock 服务监听的端口|
|mockHelper.mock.autoRun|Boolean|false|是否在应用启动时启用 mock插件|
|mockHelper.mock.apiPrefixs|Array|['/']|匹配列表中的前缀的请求会被代理，如果未设置，则将代理全部请求|
|mockHelper.configPath|String|`${workspaceFolder}/mock.config.json`|mock插件 的配置文件，可以是 require 能解析的任何文件格式|

## 注意

* 项目代理`proxy`的相关配置，需要用户根据项目的实际情况进行配置，即本插件只是在本地运行了一个`http`服务器拦截所有的请求，用户的项目需要配置`proxy`到这个服务器的地址来，才能完成整个代理流程。

```js
// port即是mock.config.json配置的proxy.port，默认10086
proxy.target = `http://127.0.0.1:${port}` || `http://localhost:${port}`
```


## 致谢文档

1. [vscode插件官方开发文档](https://code.visualstudio.com/api)
2. [yapi开放API文档](https://hellosean1025.github.io/yapi/openapi.html)
