import type { Event, ProviderResult, TreeDataProvider, TreeItem } from 'vscode'
import { EventEmitter, TreeItemCollapsibleState, window } from 'vscode'
import dayjs from 'dayjs'
import { appSysConfig } from '../core/AppSysConfig'
import { warn } from '../utils'
import type AmsApiItem from './AmsApiItem'
import AmsItem from './AmsItem'

type ProviderItemType = AmsApiItem | AmsItem

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

  private getAmsChildren(el: ProviderItemType): AmsItem[] {
    if (el instanceof AmsItem)
      return []

    const { method, path, up_time } = el.api

    const leftEle = new AmsItem('请求方式', method, TreeItemCollapsibleState.None)
    const middleEle = new AmsItem('路径', path, TreeItemCollapsibleState.None)
    const rightEle = new AmsItem('更新时间', dayjs(up_time).format('YYYY-MM-DD'), TreeItemCollapsibleState.None)

    return [
      leftEle,
      middleEle,
      rightEle,
    ]
  }
}
