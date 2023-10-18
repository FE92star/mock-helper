export interface IAmsUserInfo {
  /** 未读消息数 */
  unreadMsgNum: number
  userID: number
  userName: string
  /** 用户昵称 */
  userNickName: string
}

export interface IAmsProjectOption {
  /** api的数量 */
  apiCount: number
  /** 日志的数量 */
  logCount: number
  /** 日志列表 */
  logList: any[]
  /** 项目名称 */
  projectName: string
  /** 项目更新时间 */
  projectUpdateTime: string
}

export interface MockOptions {
  path: string
  method: string
}
