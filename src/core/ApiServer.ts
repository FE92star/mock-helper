import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import url from 'node:url'
import bodyParser from 'body-parser'
import httpProxy from 'http-proxy'
import queryString from 'query-string'
import type { StatusBarItem } from 'vscode'
import { StatusBarAlignment, TreeItemCollapsibleState, window } from 'vscode'
import { type Key, pathToRegexp } from 'path-to-regexp'
import { MOCK_CONFIG_NAME, pathAdapters, urlAdapters } from '../adapters'
import { amsServer } from '../services/AmsServer'
import ApiNodeItem from '../view/ApiNodeItem'
import type ApiController from './ApiController'
import { MOCK_ACTION_TYPE, MOCK_ACTION_TYPE_NAME, STATUS_CODE } from './type'
import { appSysConfig } from './AppSysConfig'

// 默http认代理配置
const DEFAULT_PROXY_OPTION: httpProxy.ServerOptions = {
  changeOrigin: true,
}
// 请求头json设置
const REQUEST_HEADER_OPTION: http.OutgoingHttpHeaders = {
  'Content-Type': 'application/json',
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

  // 构造器增加private参数，变为class的private属性
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

  private toJSON(o: any) {
    return JSON.stringify(o, null, 2)
  }

  /**
   * 解析json响应体
  */
  private parseJsonBody(req: http.IncomingMessage, res: http.ServerResponse) {
    const jsonParser = bodyParser.json()

    return new Promise((resolve, reject) => {
      jsonParser(req, res, (err: Error) => {
        err ? reject(err) : resolve(true)
      })
    })
  }

  /**
   * 重写请求
   * 参数?a=b&c=d ===> { a: b, c: d }
  */
  private rewriteRequest(req: http.IncomingMessage) {
    const search = req.url?.split('?')
    const query = search?.length ? queryString.parse(search[1]) : {}
    ;(req as any).query = query
    return req
  }

  /**
   * 重写响应
  */
  private rewriteResponse(res: http.ServerResponse) {
    (res as any).json = (json: any) => {
      res.writeHead(STATUS_CODE.OK, REQUEST_HEADER_OPTION)
      return res.end(this.toJSON(json))
    }
    return res
  }

  /**
   * MOCK缓存模式代理逻辑
  */
  async mockCacheHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const rootDir = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.rootDir)
    const apiPrefixs: string[] = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.apiPrefixs)

    // a. 处理异常
    if (!req.url || !amsServer.amsApiList) {
      // 1. 未获取到平台api列表数据, 返回500
      res.writeHead(STATUS_CODE.SERVER_ERROR, REQUEST_HEADER_OPTION)

      return res.end(
        this.toJSON({
          code: 999999,
          success: false,
          data: null,
          msg: '等待初始化完成',
        }))
    }

    const pathname = url.parse(req.url).pathname || ''
    if (
      pathname
      && apiPrefixs.length
      && !apiPrefixs.some(p => pathname.startsWith(p))
    ) {
      // 2. 不支持设置的apiPrefixs，返回500
      res.writeHead(STATUS_CODE.SERVER_ERROR, REQUEST_HEADER_OPTION)

      return res.end(
        this.toJSON({
          code: 999998,
          success: false,
          data: null,
          msg: '不支持该请求',
        }),
      )
    }

    // b. 正常返回
    const jsonApiPath = pathAdapters(path.join(rootDir, `${pathname}.json`))
    const jsApiPath = pathAdapters(path.join(rootDir, `${pathname}.js`))

    const isLocalJsonExist = fs.existsSync(jsonApiPath)
    const isLocalJsExist = fs.existsSync(jsApiPath)
    // path是否未url参数
    let isUrlParams = false

    // 在远端平台上对应的api
    const remoteApiItem = amsServer.amsApiList.find((ams) => {
      const url = urlAdapters(ams.path)

      const keys: Key[] = []
      const urlRegx = pathToRegexp(url, keys)

      if (keys.length)
        isUrlParams = true
      return urlRegx.test(pathname)
    })

    if (remoteApiItem) {
      // c1. 优先读取js文件
      if (isLocalJsExist) {
        // 删除缓存
        if (require.cache[jsApiPath])
          delete require.cache[jsApiPath]

        await this.parseJsonBody(req, res)

        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        return require(jsApiPath)(
          this.rewriteRequest(req),
          this.rewriteResponse(res),
        )
      }

      res.writeHead(STATUS_CODE.OK, REQUEST_HEADER_OPTION)
      // c2. 读取json
      if (isLocalJsonExist)
        return res.end(fs.readFileSync(jsonApiPath, { encoding: 'utf-8' }))

      // c3. 获取接口数据，创建本地json
      const amsApiItem = new ApiNodeItem(
        remoteApiItem,
        TreeItemCollapsibleState.None,
      )

      return this.apiController
        .fetchTargetApiInfo(amsApiItem, isUrlParams ? pathname : '')
        .then(() => {
          res.end(fs.readFileSync(jsonApiPath, { encoding: 'utf-8' }))
        })
        .catch((_err) => {
          res.end(fs.readFileSync(jsonApiPath, { encoding: 'utf-8' }))
        })
    }
    else {
      // 远程api未部署(需要找对应的服务端)
      if (isLocalJsExist) {
        // c1. 优先读取js文件
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        return require(jsApiPath)(
          this.rewriteRequest(req),
          this.rewriteResponse(res),
        )
      }

      res.writeHead(STATUS_CODE.OK, REQUEST_HEADER_OPTION)
      // c2. 读取json
      if (isLocalJsonExist)
        return res.end(fs.readFileSync(jsonApiPath, { encoding: 'utf-8' }))

      // c3. 抛错404不存在
      res.writeHead(STATUS_CODE.NOT_FOUND, REQUEST_HEADER_OPTION)
      return res.end(
        this.toJSON({
          code: 999998,
          success: false,
          data: null,
        }),
      )
    }
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
