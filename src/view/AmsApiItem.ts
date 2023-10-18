import type { Command, TreeItemCollapsibleState } from 'vscode'
import { TreeItem } from 'vscode'
import dayjs from 'dayjs'
import type ApiItem from '../core/ApiItem'

export default class AmsApiItem extends TreeItem {
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
      return `${uid} - ${dayjs(up_time).format('YYYY-MM-DD')}`

    return ''
  }

  /**
   * api的描述
  */
  get descriptions() {
    return this.api.path
  }
}
