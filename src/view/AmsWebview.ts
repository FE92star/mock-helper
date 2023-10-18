import { type ExtensionContext, type WebviewPanel, window } from 'vscode'
import type ApiItem from '../core/ApiItem'

export default class AmsWebview {
  static currentPanel: AmsWebview | undefined
  private webviews: { wv: WebviewPanel; id: string }[] = []
  private ctx: ExtensionContext | undefined

  public setContext(ctx: ExtensionContext) {
    this.ctx = ctx
  }

  public openView(api: ApiItem) {
    if (!this.ctx)
      return

    const currentWebview = this.webviews.find(wv => wv.id.includes(api.path))
    const currentColumn = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined

    if (currentWebview) {
      currentWebview.wv.reveal(currentColumn)

      return
    }

    console.log(currentWebview)
  }
}
