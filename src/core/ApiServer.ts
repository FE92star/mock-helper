import http from 'node:http'
import httpProxy from 'http-proxy'
import type { StatusBarItem } from 'vscode'
import { StatusBarAlignment, window } from 'vscode'
import type ApiController from './ApiController'
import { MOCK_ACTION_TYPE, MOCK_ACTION_TYPE_NAME } from './type'

// 默http认代理配置
export const DEFAULT_PROXY_OPTION: httpProxy.ServerOptions = {
  /** 默认将当前域名代理到目标域名 */
  changeOrigin: true,
}

// 设置允许跨域
function allowCorsOrigin(proxyRes: any, req: http.IncomingMessage) {
  const origin = req.headers.origin || req.headers.host
  proxyRes.headers['Access-Control-Allow-Credentials'] = true
  proxyRes.headers['Access-Control-Allow-Headers']
    = 'Content-Type, x-requested-with, Origin, X-Requested-With, Content-Type, Accept, Cookie, tku'
  proxyRes.headers['Access-Control-Allow-Methods']
    = 'POST, GET, PUT, OPTIONS, DELETE, PATCH'
  proxyRes.headers['Access-Control-Allow-Origin'] = origin || '*'
  proxyRes.headers['Access-Control-Max-Age'] = 3600
}

/**
 * 运行api服务
*/
export default class ApiServer {
  // httpServer服务实例
  private server: http.Server | undefined
  // 请求状态条
  private statusBarViewItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100)
  // 响应请求的handle
  private proxyHandler: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => void

  constructor(private apiController: ApiController) {
    // 默认MOCK缓存模式
    this.proxyHandler = this.mockCacheHandler
  }

  /**
   * 初始化默认
  */
  initDefaultProxy(configData: Yapi.Config.Json) {
    const { proxy } = configData || {}
    const { targets = [] } = proxy || {}
    const defaultProxyInfo = {
      name: MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.MOCK],
    }

    // 没有配置目标代理地址，走默认
    if (!targets)
      return defaultProxyInfo

    const defaultProxy = targets.find(item => item?.default)
    if (!defaultProxy)
      return defaultProxyInfo

    // 开启代理服务
    return defaultProxy
  }

  /**
   * 启动proxy server
  */
  public async runProxyServer() {
    // const mockPort = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.port)

    // 1
    this.proxyHandler = () => null
    this.server = http.createServer(this.serverProxyHandler)
  }

  /**
   * 基于proxyHandler做一层包装
  */
  serverProxyHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    this.proxyHandler(req, res)
  }

  /**
   * MOCK缓存模式代理逻辑
  */
  mockCacheHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    // TODO: 逻辑待完善
    return (req?.url || '') + res.destroyed
  }

  /**
   * 创建代理服务器，参数value可传几种类型
   * 1. 自定义域名/ip字符串 http://195.88.66
   * 2. httpProxy.ServerOptions
   * 3. 配置文件的proxy.target
  */
  setupProxy(value: string | httpProxy.ServerOptions | Yapi.Config.Target) {
    const proxyServer = httpProxy.createProxyServer()
    // 监听代理错误事件
    proxyServer.on('error', (e) => {
      window.showErrorMessage(e.message)
    })
    // 监听代理响应事件
    proxyServer.on('proxyRes', allowCorsOrigin)

    this.proxyHandler = (req, res) => {
      if (typeof value === 'object' && Array.isArray(value.target)) {
        // 处理多源代理逻辑
        const globItem = value.target.find(v => v.match === '*') || { target: '' }

        const matchItem = value.target.find((v) => {
          return (v.match !== '*' && new RegExp(v.match).test(req.url || ''))
        })

        // 以非通配规则为主
        if (matchItem)
          proxyServer.web(req, res, this.mergeProxyOptions(matchItem.target))
        else
          proxyServer.web(req, res, this.mergeProxyOptions(globItem.target))
      }
      else {
        proxyServer.web(req, res, this.mergeProxyOptions(value as string))
      }
    }

    if (typeof value === 'string')
      this.updateStatusBar(value)
    else
      this.updateStatusBar(this.getNameFromProxyOption(value))
  }

  /**
   * 管理statusBar
  */
  private updateStatusBar(text?: string, command?: string) {
    if (command)
      this.statusBarViewItem.command = command

    if (text) {
      this.statusBarViewItem.text = `当前代理: ${text}`
      this.statusBarViewItem.show()
    }
    else {
      this.statusBarViewItem.hide()
    }
  }

  /**
   * 合并proxy的配置项
  */
  private mergeProxyOptions(option: string | httpProxy.ServerOptions) {
    let options: httpProxy.ServerOptions

    if (typeof option === 'string') {
      options = {
        ...DEFAULT_PROXY_OPTION,
        target: option,
      }
    }
    else {
      options = {
        ...DEFAULT_PROXY_OPTION,
        ...option,
      }
    }

    return options
  }

  private getNameFromProxyOption(option: httpProxy.ServerOptions | Yapi.Config.Target): string {
    if ((option as Yapi.Config.Target).name)
      return (option as Yapi.Config.Target).name

    if (typeof (option as httpProxy.ServerOptions).target === 'string')
      return (option as httpProxy.ServerOptions).target as string
    else
      return ''
  }
}
