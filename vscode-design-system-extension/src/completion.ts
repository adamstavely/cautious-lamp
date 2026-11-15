import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';
import { completionCandidates } from './tokenLookup';

export class CompletionProvider implements vscode.CompletionItemProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null> {
    try {
      const linePrefix = document.lineAt(position).text.slice(0, position.character);
      const items: vscode.CompletionItem[] = [];

      // Token paths: `tokens.`, `tokens.color.`, or a bare `color.` / `spacing.`
      const tokens = /\.$/.test(linePrefix) ? await this.api.getTokens() : [];
      const candidates = completionCandidates(linePrefix, tokens) ?? [];
      candidates.forEach(({ token, insertText, replacesDot }) => {
        const item = new vscode.CompletionItem(token.name, vscode.CompletionItemKind.Variable);
        item.detail = `${token.category} • ${token.value}`;
        item.documentation = new vscode.MarkdownString(
          `**Value:** \`${token.value}\`\n\n${token.description || ''}`
        );
        item.insertText = insertText;
        if (replacesDot) {
          // `spacing.2xl` isn't valid JS: write `spacing['2xl']` over the dot
          item.range = new vscode.Range(position.translate(0, -1), position);
          item.filterText = `.${insertText}`;
        } else {
          item.filterText = insertText;
        }
        items.push(item);
      });

    // Check for components. prefix
    if (linePrefix.match(/components\.$/)) {
      const components = await this.api.getComponents();
      components.forEach(component => {
        const item = new vscode.CompletionItem(
          component.name,
          vscode.CompletionItemKind.Class
        );
        item.detail = component.category;
        item.documentation = new vscode.MarkdownString(component.description || '');
        item.insertText = component.name;
        items.push(item);
      });
    }

    // Check for component usage in JSX/Vue templates
    if (linePrefix.match(/<[A-Z]/)) {
      const components = await this.api.getComponents();
      components.forEach(component => {
        const item = new vscode.CompletionItem(
          component.name,
          vscode.CompletionItemKind.Class
        );
        item.detail = `Design System Component • ${component.category}`;
        item.documentation = new vscode.MarkdownString(component.description || '');
        item.insertText = component.name;
        items.push(item);
      });
    }

      return items.length > 0 ? items : null;
    } catch (error: any) {
      if (this.outputChannel) {
        this.outputChannel.appendLine(`Error providing completions: ${error.message}`);
      }
      return null;
    }
  }
}

