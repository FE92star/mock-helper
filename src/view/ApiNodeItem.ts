import path from 'node:path'
import type { Command, TreeItemCollapsibleState } from 'vscode'
import { TreeItem } from 'vscode'
import { formatDate } from '../utils'
import type ApiItem from '../core/ApiItem'

/**
 * api节点视图
*/
export default class ApiNodeItem extends TreeItem {
  constructor(
    public api: ApiItem,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
  ) {
    super(api.title, collapsibleState)
  }

  tooltip = this.tooltips

  description = this.descriptions

  /**
   * api的悬浮提示
  */
  get tooltips() {
    const { uid, up_time } = this.api

    if (uid && up_time)
      return `${uid} - ${formatDate(up_time)}`

    return ''
  }

  /**
   * api的描述
  */
  get descriptions() {
    return this.api.path
  }

  iconPath = {
    light: path.join(__dirname, 'resources', 'light/api.svg'),
    dark: path.join(__filename, 'resources', 'dark/api.svg'),
  }

  contextValue = 'apiNodeItem'
}
