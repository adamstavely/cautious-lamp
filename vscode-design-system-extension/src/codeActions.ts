import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';

export class CodeActionsProvider implements vscode.CodeActionProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    try {
      const actions: vscode.CodeAction[] = [];
      const selectedText = document.getText(range);

    // Check for hardcoded color values
    const colorMatch = selectedText.match(/^#[0-9a-fA-F]{6}$/i);
    if (colorMatch) {
      const colorValue = colorMatch[0];
      const tokens = await this.api.getTokens();
      const matchingToken = tokens.find(t => 
        t.type === 'color' && t.value.toLowerCase() === colorValue.toLowerCase()
      );

      if (matchingToken) {
        const action = new vscode.CodeAction(
          `Replace with token: ${matchingToken.name}`,
          vscode.CodeActionKind.QuickFix
        );
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(
          document.uri,
          range,
          `tokens.${matchingToken.name}`
        );
        action.diagnostics = context.diagnostics;
        actions.push(action);
      } else {
        // Suggest finding a token
        const action = new vscode.CodeAction(
          'Find matching design token',
          vscode.CodeActionKind.QuickFix
        );
        action.command = {
          command: 'designSystem.replaceWithToken',
          title: 'Find matching design token'
        };
        actions.push(action);
      }
    }

    // Check for hardcoded spacing values
    const spacingMatch = selectedText.match(/^(\d+)px$/);
    if (spacingMatch) {
      const spacingValue = spacingMatch[1];
      const tokens = await this.api.getTokens();
      const matchingToken = tokens.find(t => 
        t.type === 'spacing' && t.value === spacingValue
      );

      if (matchingToken) {
        const action = new vscode.CodeAction(
          `Replace with token: ${matchingToken.name}`,
          vscode.CodeActionKind.QuickFix
        );
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(
          document.uri,
          range,
          `tokens.${matchingToken.name}`
        );
        action.diagnostics = context.diagnostics;
        actions.push(action);
      }
    }

      return actions;
    } catch (error: any) {
      if (this.outputChannel) {
        this.outputChannel.appendLine(`Error providing code actions: ${error.message}`);
      }
      return [];
    }
  }
}

