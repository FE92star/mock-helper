export enum MOCK_ACTION_TYPE {
  /** 自定义代理地址 */
  CUSTOM,
  /** MOCK缓存模式 */
  MOCK,
  /** 直连YAPI的MOCK数据模式 */
  YAPI_MOCK,
}

export const MOCK_ACTION_TYPE_NAME = {
  [MOCK_ACTION_TYPE.CUSTOM]: '自定义代理地址',
  [MOCK_ACTION_TYPE.MOCK]: 'MOCK缓存模式',
  [MOCK_ACTION_TYPE.YAPI_MOCK]: '直连YAPI的MOCK数据模式',
}

export const MOCK_ACTION_TYPE_DESC = {
  [MOCK_ACTION_TYPE.CUSTOM]: '使用自定义的服务IP地址',
  [MOCK_ACTION_TYPE.MOCK]: '直接代理到项目的本地mock/*文件地址',
  [MOCK_ACTION_TYPE.YAPI_MOCK]: '直接代理到YAPI平台的mock数据地址',
  mutipleProxy: '多源代理模式',
}

export const BASIC_MOCK_PICK_OPTIONS = [
  {
    label: MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.CUSTOM],
    description: MOCK_ACTION_TYPE_DESC[MOCK_ACTION_TYPE.CUSTOM],
    target: MOCK_ACTION_TYPE.CUSTOM,
  },
  {
    label: MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.MOCK],
    description: MOCK_ACTION_TYPE_DESC[MOCK_ACTION_TYPE.MOCK],
    target: MOCK_ACTION_TYPE.MOCK,
  },
  {
    label: MOCK_ACTION_TYPE_NAME[MOCK_ACTION_TYPE.YAPI_MOCK],
    description: MOCK_ACTION_TYPE_DESC[MOCK_ACTION_TYPE.YAPI_MOCK],
    target: MOCK_ACTION_TYPE.YAPI_MOCK,
  },
]

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
