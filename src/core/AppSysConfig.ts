import { ConfigurationTarget, workspace } from 'vscode'
import { GLOBAL_APP_IDENTIFIER } from '../adapters'

/**
 * 插件系统配置相关
*/
export default class AppSysConfig {
  rootPath = ''
  replacement: Map<RegExp, string> = new Map()

  properties = {
    ams: 'ams',
    user: 'user',
    projectID: 'projectID',
    mockOption: 'mockOption',
    preview: 'preview',
    mock: 'mock',
    configPath: 'configPath',
  }

  constructor() {
    const workspaceFolders = workspace.workspaceFolders
    if (workspaceFolders) {
      // 兼容 windows，使用 fsPath，而不是 path
      this.rootPath = workspaceFolders[0].uri.fsPath
      this.replacement = new Map([])
      this.replacement.set(/\$\{workspaceFolder\}/, this.rootPath)
    }
  }

  public addReplacement(key: RegExp, value: string) {
    this.replacement.set(key, value)
    return this
  }

  public identifierWithDot(name: string) {
    return `${GLOBAL_APP_IDENTIFIER}.${name}`
  }

  public replacePlaceholder(text: string) {
    for (const [k, v] of this.replacement) {
      if (k.test(text))
        return text.replace(k, v)
    }

    return text
  }

  public getConfiguration(key: string): any {
    const property = workspace.getConfiguration(GLOBAL_APP_IDENTIFIER).get<string>(key)
    if (property)
      return this.replacePlaceholder(property)

    return ''
  }

  public setConfiguration(key: string, value: any) {
    return workspace
      .getConfiguration()
      .update(this.identifierWithDot(key), value, ConfigurationTarget.Global)
  }
}

export const appSysConfig = new AppSysConfig()
