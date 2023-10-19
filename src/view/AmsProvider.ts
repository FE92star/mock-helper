import type { Event, ProviderResult, TreeDataProvider, TreeItem } from 'vscode'
import { EventEmitter, TreeItemCollapsibleState, window } from 'vscode'
import { appSysConfig } from '../core/AppSysConfig'
import { formatDate, warn } from '../utils'
import type ApiNodeItem from './ApiNodeItem'
import NodeItem from './NodeItem'

type ProviderItemType = ApiNodeItem | NodeItem

export default class AmsProvider implements TreeDataProvider<ProviderItemType> {
  private _onDidChangeTreeData: EventEmitter<ProviderItemType | undefined> = new EventEmitter<
    ProviderItemType | undefined
  >()

  readonly onDidChangeTreeData?: Event<void | ProviderItemType | ProviderItemType[] | null | undefined> | undefined = this._onDidChangeTreeData.event

  getTreeItem(element: ProviderItemType): TreeItem | Thenable<TreeItem> {
    return element
  }

  /**
   * 刷新当前视图
  */
  refresh() {
    this._onDidChangeTreeData.fire(undefined)
  }

  getChildren(element?: ProviderItemType | undefined): ProviderResult<ProviderItemType[]> {
    if (!appSysConfig.rootPath) {
      window.showInformationMessage(warn('工作区为空'))

      return Promise.resolve([])
    }

    if (element) {
      const amsChildren = this.getAmsChildren(element)
      return Promise.resolve(amsChildren)
    }
  }

  private getAmsChildren(el: ProviderItemType): NodeItem[] {
    if (el instanceof NodeItem)
      return []

    const { method, path, up_time } = el.api

    const leftEle = new NodeItem('请求方式', method, TreeItemCollapsibleState.None)
    const middleEle = new NodeItem('路径', path, TreeItemCollapsibleState.None)
    const rightEle = new NodeItem('更新时间', formatDate(up_time), TreeItemCollapsibleState.None)

    return [
      leftEle,
      middleEle,
      rightEle,
    ]
  }
}
