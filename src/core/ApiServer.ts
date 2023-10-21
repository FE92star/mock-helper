import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import url from 'node:url'
import bodyParser from 'body-parser'
import httpProxy from 'http-proxy'
import queryString from 'query-string'
import { StatusBarAlignment, type StatusBarItem, TreeItemCollapsibleState, window } from 'vscode'
import { type Key, pathToRegexp } from 'path-to-regexp'
import { MOCK_CONFIG_NAME, pathAdapters, urlAdapters, yapiMockDataAdapters } from '../adapters'
import { amsServer } from '../services/AmsServer'
import ApiNodeItem from '../view/ApiNodeItem'
import { winError } from '../utils'
import type ApiController from './ApiController'
import { BASIC_MOCK_PICK_OPTIONS, MOCK_ACTION_TYPE, MOCK_ACTION_TYPE_DESC, MOCK_ACTION_TYPE_NAME, STATUS_CODE } from './type'
import { appSysConfig } from './AppSysConfig'
import { appUserConfig } from './AppUserConfig'
import { DEFAULT_PROXY_OPTION, REQUEST_HEADER_OPTION, allowCorsOrigin } from './httpConfig'

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
    this.setupProxy(defaultProxy)

    return defaultProxy
  }

  /**
   * 启动proxy server
  */
  public async runProxyServer() {
    const mockPort = appSysConfig.getConfiguration(MOCK_CONFIG_NAME.port)
    const configPath = appSysConfig.getConfiguration(appSysConfig.properties.configPath)

    // 默认MOCK缓存模式
    this.proxyHandler = this.mockCacheHandler
    try {
      this.server = http.createServer((req, res) => {
        this.serverProxyHandler(req, res)
      })

      let _mockPort = mockPort
      let _defaultProxyInfo = { name: MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.MOCK] }
      // port以userConfig(mock.config.json)为主
      if (fs.existsSync(configPath)) {
        _mockPort = appUserConfig.config.proxy.port
        _defaultProxyInfo = this.initDefaultProxy(appUserConfig.config)
      }

      const serverSuccess = this.server.listen(_mockPort)
      if (serverSuccess.listening) {
      // 启动成功
        return Promise.resolve({ port: _mockPort, defaultProxyInfo: _defaultProxyInfo })
      }
      else {
        return Promise.reject(new Error('服务启动失败'))
      }
    }
    catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * 停止proxy server
  */
  public stopProxyServer() {
    return new Promise((resolve, reject) => {
      // 服务未启动return
      if (!this.server)
        return resolve(true)

      this.server.close((err) => {
        if (err)
          reject(err)

        // 删除httpServer实例
        this.server = undefined
        resolve(true)
      })
    })
  }

  /**
   * 基于proxyHandler做一层包装，处理切换的问题
  */
  serverProxyHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    this.proxyHandler(req, res)
  }

  private toStringify(o: any) {
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
      return res.end(this.toStringify(json))
    }
    return res
  }

  /**
   * 直连YAPI的MOCK数据模式代理逻辑
  */
  async yapiMockHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const { url, method = 'GET' } = req
    const reqApi = url?.split('?')[0] || ''

    if (!reqApi) {
      res.writeHead(STATUS_CODE.NOT_FOUND, REQUEST_HEADER_OPTION)
      return res.end(
        this.toStringify({
          code: 999999,
          success: false,
          data: null,
          desc: 'YAPI平台未部署，请联系服务端',
        }),
      )
    }

    // 从yapi平台mock地址拉取数据
    try {
      const yapiMockData = await amsServer.getMockData({ path: reqApi, method })
      return res.end(yapiMockDataAdapters(yapiMockData))
    }
    catch (error) {
      res.writeHead(STATUS_CODE.SERVER_ERROR, REQUEST_HEADER_OPTION)
      return res.end(
        this.toStringify({
          code: 999999,
          success: false,
          data: null,
          desc: '获取YAPI平台mock数据失败，请稍后重试或联系服务端',
        }),
      )
    }
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
        this.toStringify({
          code: 999999,
          success: false,
          data: null,
          desc: '等待初始化完成',
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
        this.toStringify({
          code: 999998,
          success: false,
          data: null,
          desc: '不支持该请求',
        }),
      )
    }

    // b. 正常返回
    const jsonApiPath = pathAdapters(path.join(rootDir, `${pathname}.json`))
    const jsApiPath = pathAdapters(path.join(rootDir, `${pathname}.js`))

    const isLocalJsonExist = fs.existsSync(jsonApiPath)
    const isLocalJsExist = fs.existsSync(jsApiPath)
    // path是否为url参数
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
        this.toStringify({
          code: 999998,
          success: false,
          data: null,
        }),
      )
    }
  }

  /**
   * 用户配置的proxy.targets
  */
  get configTargets() {
    const originTargets = appUserConfig.config.proxy.targets || []

    return originTargets.map((v) => {
      let targetConfig
      // 多源代理模式的targets
      let mutipleProxyTargets: any[] = []
      const { name, target } = v

      if (!Array.isArray(target)) {
        targetConfig = this.mergeProxyOptions(target)
      }
      else {
        const globMatchTarget = target.find(w => w.match === '*')
        targetConfig = this.mergeProxyOptions(globMatchTarget?.target || '')
        mutipleProxyTargets = target
      }

      return {
        ...targetConfig,
        name,
        mutipleProxyTargets,
      }
    })
  }

  get userConfigTarget() {
    return this.configTargets.map((conf) => {
      const isMultipleProxy = conf.mutipleProxyTargets.length

      return {
        label: this.getNameFromProxyOption(conf),
        description: isMultipleProxy ? MOCK_ACTION_TYPE_DESC.mutipleProxy : conf.target as string,
        target: isMultipleProxy ? conf.mutipleProxyTargets : conf.target as string,
      }
    })
  }

  public async switchProxy() {
    const userTarget = await window.showQuickPick(
      [
        ...BASIC_MOCK_PICK_OPTIONS,
        ...this.userConfigTarget,
      ],
      { placeHolder: '请选择代理目标' },
    )

    if (!userTarget?.target)
      return

    const coreTarget = userTarget.target as MOCK_ACTION_TYPE

    switch (coreTarget) {
      // 1. 自定义配置模式
      case MOCK_ACTION_TYPE.CUSTOM: {
        const inputValue = await window.showInputBox({
          placeHolder: '例如：http://192.186.0.1:10086',
        })

        if (!inputValue)
          return

        this.setupProxy(inputValue)

        break
      }
      // 2. mock缓存模式
      case MOCK_ACTION_TYPE.MOCK: {
        this.setupMockCacheProxy()

        break
      }
      // 3. yapi直连模式
      case MOCK_ACTION_TYPE.YAPI_MOCK: {
        this.setupYapiMockProxy()

        break
      }
      // 4. 默认用户配置环境
      default:
        this.setupProxy(coreTarget, true)
        break
    }
  }

  setupMockCacheProxy() {
    this.proxyHandler = this.mockCacheHandler
    this.updateStatusBar(MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.MOCK])
  }

  setupYapiMockProxy() {
    this.proxyHandler = this.yapiMockHandler
    this.updateStatusBar(MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.YAPI_MOCK])
  }

  /**
   * 自定义代理地址模式/用户配置环境选择模式(域名代理)
   * 创建代理服务器，参数value可传几种类型
   * 1. 自定义域名/ip字符串 http://195.88.66
   * 2. httpProxy.ServerOptions
   * 3. 配置文件的proxy.target
  */
  setupProxy(value: string | httpProxy.ServerOptions | Yapi.Config.Target, isUserTarget = false) {
    const proxyServer = httpProxy.createProxyServer()
    // 监听代理错误事件
    proxyServer.on('error', (e) => {
      winError(e.message)
    })
    // 监听代理响应事件
    proxyServer.on('proxyRes', allowCorsOrigin)

    this.proxyHandler = (req, res) => {
      if (typeof value === 'object' && Array.isArray(value.target)) {
        // 处理多源代理模式逻辑
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

    if (typeof value === 'string') {
      const userTargetName = this.userConfigTarget.find(config => config.target === value)?.label || value
      const newValue = isUserTarget ? userTargetName : value
      this.updateStatusBar(newValue)
    }
    else {
      this.updateStatusBar(this.getNameFromProxyOption(value))
    }
  }

  /**
   * 管理statusBar
  */
  updateStatusBar(text?: string, command?: string) {
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
