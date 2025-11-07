import * as vscode from 'vscode';
import { DesignSystemAPI, Component, Token } from './api';

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
      const linePrefix = document.lineAt(position).text.substr(0, position.character);
      const items: vscode.CompletionItem[] = [];

      // Check for tokens. prefix
      if (linePrefix.match(/tokens\.$/)) {
        const tokens = await this.api.getTokens();
      tokens.forEach(token => {
        const item = new vscode.CompletionItem(
          token.name,
          vscode.CompletionItemKind.Variable
        );
        item.detail = `${token.category} • ${token.type}`;
        item.documentation = new vscode.MarkdownString(
          `**Value:** \`${token.value}\`\n\n${token.description || ''}`
        );
        item.insertText = token.name;
        items.push(item);
      });
    }

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

    // Check for token usage patterns
    const tokenPattern = /(?:color|spacing|typography|radius|shadow)\./;
    if (tokenPattern.test(linePrefix)) {
      const tokens = await this.api.getTokens();
      const category = linePrefix.match(/(\w+)\.$/)?.[1];
      tokens
        .filter(t => !category || t.category.toLowerCase() === category.toLowerCase())
        .forEach(token => {
          const item = new vscode.CompletionItem(
            token.name,
            vscode.CompletionItemKind.Variable
          );
          item.detail = `Token • ${token.value}`;
          item.documentation = new vscode.MarkdownString(
            `**Value:** \`${token.value}\`\n\n${token.description || ''}`
          );
          item.insertText = token.name;
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

