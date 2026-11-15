import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';
import { findHardcodedValues } from './tokenLookup';

export const DIAGNOSTIC_SOURCE = 'Design System';
export const DIAGNOSTIC_LANGUAGES = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact', 'css', 'scss', 'less', 'html'];

/**
 * Warns about hard-coded colours and spacing that equal a design token, on
 * open and on edit (debounced). The "Replace with token" quick fix clears them.
 */
export class HardcodedValueDiagnostics implements vscode.Disposable {
  private collection = vscode.languages.createDiagnosticCollection('designSystem');
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private disposables: vscode.Disposable[] = [];

  constructor(
    private api: DesignSystemAPI,
    private importPath: () => string,
    private outputChannel?: vscode.OutputChannel
  ) {
    this.disposables.push(
      this.collection,
      vscode.workspace.onDidOpenTextDocument(doc => this.schedule(doc, 0)),
      vscode.workspace.onDidChangeTextDocument(e => this.schedule(e.document, 500)),
      vscode.workspace.onDidCloseTextDocument(doc => this.collection.delete(doc.uri))
    );
    vscode.workspace.textDocuments.forEach(doc => this.schedule(doc, 0));
  }

  /** Re-checks every open document (after the tokens or settings change) */
  refreshAll() {
    vscode.workspace.textDocuments.forEach(doc => this.schedule(doc, 0));
  }

  private schedule(document: vscode.TextDocument, delay: number) {
    if (document.uri.scheme !== 'file' || !DIAGNOSTIC_LANGUAGES.includes(document.languageId)) return;
    const key = document.uri.toString();
    clearTimeout(this.timers.get(key));
    this.timers.set(key, setTimeout(() => {
      this.timers.delete(key);
      this.update(document).catch(error => this.outputChannel?.appendLine(`Error checking ${document.fileName}: ${error.message}`));
    }, delay));
  }

  private async update(document: vscode.TextDocument) {
    const tokens = await this.api.getTokens();
    if (document.isClosed) return;
    const diagnostics = findHardcodedValues(document.getText(), document.languageId, tokens, this.importPath()).map(found => {
      const range = new vscode.Range(document.positionAt(found.start), document.positionAt(found.end));
      const diagnostic = new vscode.Diagnostic(
        range,
        `Hard-coded ${found.value} matches design token ${found.token.name}`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.source = DIAGNOSTIC_SOURCE;
      diagnostic.code = 'hardcoded-value';
      return diagnostic;
    });
    this.collection.set(document.uri, diagnostics);
  }

  dispose() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.disposables.forEach(d => d.dispose());
  }
}
