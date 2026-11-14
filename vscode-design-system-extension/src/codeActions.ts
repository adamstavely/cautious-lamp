import * as vscode from 'vscode';
import { DesignSystemAPI, Token } from './api';
import { computeTokenReplacement } from './tokenEdit';

const DEFAULT_TOKEN_IMPORT_PATH = '@design-system/tokens';

/** The token whose value is exactly `value` (a hex color, or spacing like `16px`) */
export function findTokenForValue(tokens: Token[], value: string): Token | undefined {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    return tokens.find(t => t.type === 'color' && String(t.value).toLowerCase() === trimmed.toLowerCase());
  }
  const spacing = /^(\d+(?:\.\d+)?)px$/.exec(trimmed);
  if (spacing) {
    // Spacing tokens are stored as "16px" or as a bare number "16"
    return tokens.find(t => t.type === 'spacing' && (t.value === trimmed || t.value === spacing[1]));
  }
  return tokens.find(t => (t.type === 'color' || t.type === 'spacing') && String(t.value).toLowerCase() === trimmed.toLowerCase());
}

/**
 * A WorkspaceEdit that swaps the value in `range` for a reference to `token`,
 * written for the file type (see computeTokenReplacement), or undefined when
 * the value isn't somewhere a token reference can go.
 */
export function buildTokenEdit(document: vscode.TextDocument, range: vscode.Range, token: Token): vscode.WorkspaceEdit | undefined {
  const importPath = vscode.workspace.getConfiguration('designSystem').get<string>('tokenImportPath') || DEFAULT_TOKEN_IMPORT_PATH;
  const replacement = computeTokenReplacement(
    document.getText(),
    document.offsetAt(range.start),
    document.offsetAt(range.end),
    document.languageId,
    token.name,
    { importPath }
  );
  if (!replacement) return undefined;
  const edit = new vscode.WorkspaceEdit();
  for (const e of replacement.edits) {
    edit.replace(document.uri, new vscode.Range(document.positionAt(e.start), document.positionAt(e.end)), e.newText);
  }
  return edit;
}

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
      const selectedText = document.getText(range);
      if (!/^(#[0-9a-f]{3,8}|\d+(\.\d+)?px)$/i.test(selectedText)) return [];

      const tokens = await this.api.getTokens();
      const matchingToken = findTokenForValue(tokens, selectedText);

      if (matchingToken) {
        const edit = buildTokenEdit(document, range, matchingToken);
        if (!edit) return [];
        const action = new vscode.CodeAction(`Replace with token: ${matchingToken.name}`, vscode.CodeActionKind.QuickFix);
        action.edit = edit;
        action.diagnostics = context.diagnostics;
        return [action];
      }

      if (selectedText.startsWith('#')) {
        // Suggest finding a token
        const action = new vscode.CodeAction('Find matching design token', vscode.CodeActionKind.QuickFix);
        action.command = {
          command: 'designSystem.replaceWithToken',
          title: 'Find matching design token'
        };
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
