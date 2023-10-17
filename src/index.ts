import { type ExtensionContext, commands, window } from 'vscode'

export function activate(ctx: ExtensionContext) {
  const disposable = commands.registerCommand('extension.helloWorld', () => {
    window.showInformationMessage('Hello world')
  })

  ctx.subscriptions.push(disposable)
}

export function deactivate() {

}
