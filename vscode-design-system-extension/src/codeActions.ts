import * as vscode from 'vscode';
import { DesignSystemAPI, Token } from './api';
import { computeTokenReplacement } from './tokenEdit';
import { findTokenForValue } from './tokenLookup';
import { DIAGNOSTIC_SOURCE } from './diagnostics';

export { findTokenForValue };

/** The module quick fixes import `tokens` from; empty means they write `var(--token)` instead */
export function tokenImportPath(): string {
  return vscode.workspace.getConfiguration('designSystem').get<string>('tokenImportPath', '').trim();
}

/**
 * A WorkspaceEdit that swaps the value in `range` for a reference to `token`,
 * written for the file type (see computeTokenReplacement), or undefined when
 * the value isn't somewhere a token reference can go.
 */
export function buildTokenEdit(document: vscode.TextDocument, range: vscode.Range, token: Token): vscode.WorkspaceEdit | undefined {
  const replacement = computeTokenReplacement(
    document.getText(),
    document.offsetAt(range.start),
    document.offsetAt(range.end),
    document.languageId,
    token.name,
    { importPath: tokenImportPath() }
  );
  if (!replacement) return undefined;
  const edit = new vscode.WorkspaceEdit();
  for (const e of replacement.edits) {
    edit.replace(document.uri, new vscode.Range(document.positionAt(e.start), document.positionAt(e.end)), e.newText);
  }
  return edit;
}

const REPLACEABLE_VALUE = /^(#[0-9a-f]{3,8}|(\d+(\.\d+)?|\.\d+)(px|rem))$/i;

export class CodeActionsProvider implements vscode.CodeActionProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    try {
      // A hard-coded-value warning under the cursor, else the selection
      const diagnostic = context.diagnostics.find(d => d.source === DIAGNOSTIC_SOURCE);
      const target = diagnostic?.range ?? range;
      const selectedText = document.getText(target);
      if (!REPLACEABLE_VALUE.test(selectedText)) return [];

      const tokens = await this.api.getTokens();
      const matchingToken = findTokenForValue(tokens, selectedText);

      if (matchingToken) {
        const edit = buildTokenEdit(document, target, matchingToken);
        if (!edit) return [];
        const action = new vscode.CodeAction(`Replace with token: ${matchingToken.name}`, vscode.CodeActionKind.QuickFix);
        action.edit = edit;
        if (diagnostic) {
          action.diagnostics = [diagnostic];
          action.isPreferred = true;
        }
        return [action];
      }
      return [];
    } catch (error: any) {
      if (this.outputChannel) {
        this.outputChannel.appendLine(`Error providing code actions: ${error.message}`);
      }
      return [];
    }
  }
}
