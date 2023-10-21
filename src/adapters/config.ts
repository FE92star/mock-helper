/** 全局插件应用id */
export const GLOBAL_APP_IDENTIFIER = 'mockHelper'

export const APP_NAME_PREFIX = '[MOCK小助手]'

export const MOCK_CONFIG_NAME = {
  rootDir: 'mock.rootDir',
  port: 'mock.port',
  autoRun: 'mock.autoRun',
  apiPrefixs: 'mock.apiPrefixs',
}

/** 全局应用上下文状态 */
export const GLOBAL_APP_CONTEXT = {
  /** server是否启动 */
  serverEnable: 'serverEnable',
  /** 是否开始过滤api */
  filterEnable: 'filterEnable',
}

export const COMMAND_SWITCH_PROXY_ID = 'switchProxy'

/** commandId标识符 */
export const COMMAND_ID_IDENTIFIERS = {
  /** 搜索api */
  search: 'search',
  /** 清空搜索信息 */
  clear: 'clear',
  /** 刷新列表信息 */
  refresh: 'refresh',
  /** 复制api信息 */
  copy: 'copy',
  /** 启动服务 */
  runServer: 'runServer',
  /** 关闭服务 */
  stopServer: 'stopServer',
  /** 打开本地json文件 */
  openJon: 'openJon',
  /** 下载api信息并创建本地Json文件 */
  download: 'download',
  /** TODO-打开api的类型信息展示 */
  // openApi: 'openApi',
}
