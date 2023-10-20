export enum MOCK_ACTION_TYPE {
  /** 自定义代理地址 */
  CUSTOM,
  /** MOCK缓存模式 */
  MOCK,
  /** 混合Mock模式 */
  MIXED_MOCK,
}

export const MOCK_ACTION_TYPE_NAME = {
  [MOCK_ACTION_TYPE.CUSTOM]: '自定义代理地址',
  [MOCK_ACTION_TYPE.MOCK]: 'MOCK缓存模式',
  [MOCK_ACTION_TYPE.MIXED_MOCK]: '混合Mock模式',
}

/**
 * 响应状态码
*/
export enum STATUS_CODE {
  /** 成功 */
  OK = 200,
  /** 未找到 */
  NOT_FOUND = 404,
  /** 服务器出错 */
  SERVER_ERROR = 500,
}

/**
 * 同一个开发环境多目标地址匹配
*/
export type MultipleTarget = {
  /** 匹配规则 */
  match: string
  /** 代理环境地址 */
  target: string
}[]

export interface CoreConfigOptions {
  /** 接口服务的基础地址 */
  baseUrl: string
}
