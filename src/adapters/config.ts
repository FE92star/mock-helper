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

/** commandId标识符 */
export const COMMAND_ID_IDENTIFIER = {
  /** 切换proxy源 */
  switchProxy: 'switchProxy',
}
