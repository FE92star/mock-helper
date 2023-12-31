import path from 'node:path'
import type { Command, TreeItemCollapsibleState } from 'vscode'
import { TreeItem } from 'vscode'

/**
 * 每一条节点的tree
*/
export default class NodeItem extends TreeItem {
  constructor(
    public label: string,
    public description?: string,
    public readonly collapsibleState?: TreeItemCollapsibleState,
    public readonly command?: Command,
  ) {
    super(label, collapsibleState)
  }

  iconPath = {
    light: path.join(__dirname, 'resources', 'light/git-commit.svg'),
    dark: path.join(__filename, 'resources', 'dark/git-commit.svg'),
  }

  contextValue = 'nodeItem'
}
