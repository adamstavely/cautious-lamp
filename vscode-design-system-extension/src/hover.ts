import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';
import { findTokenByReference, hardcodedColorHoverMarkdown, hexColorAt, tokenHoverMarkdown, tokenReferenceAt } from './tokenLookup';

export class HoverProvider implements vscode.HoverProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    try {
      const lineText = document.lineAt(position.line).text;
      const lineRange = (start: number, end: number) => new vscode.Range(position.line, start, position.line, end);

      // Token references: `tokens.color.primary`, `tokens.spacing['2xl']`, `var(--color-primary)`
      const reference = tokenReferenceAt(lineText, position.character);
      if (reference) {
        const tokens = await this.api.getTokens();
        const token = findTokenByReference(tokens, reference);
        if (token) {
          return new vscode.Hover(new vscode.MarkdownString(tokenHoverMarkdown(tokens, token)), lineRange(reference.start, reference.end));
        }
      }

      // Hard-coded colours. The word pattern stops before `#`, so read the colour from the line
      const hex = hexColorAt(lineText, position.character);
      if (hex) {
        const tokens = await this.api.getTokens();
        return new vscode.Hover(new vscode.MarkdownString(hardcodedColorHoverMarkdown(tokens, hex.value)), lineRange(hex.start, hex.end));
      }

      // Components
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return null;
      }
      const component = await this.api.getComponent(document.getText(wordRange));
      if (component) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### ${component.name}\n\n`);
        markdown.appendMarkdown(`${component.description || ''}\n\n`);
        markdown.appendMarkdown(`**Category:** ${component.category}\n\n`);

        if (component.props && component.props.length > 0) {
          markdown.appendMarkdown(`### Props\n\n`);
          component.props.forEach(prop => {
            markdown.appendMarkdown(`- **${prop.name}** (\`${prop.type}\`)${prop.required ? ' *required*' : ''}\n`);
            if (prop.description) {
              markdown.appendMarkdown(`  ${prop.description}\n`);
            }
            if (prop.default !== undefined) {
              markdown.appendMarkdown(`  *Default: \`${prop.default}\`*\n`);
            }
          });
        }

        return new vscode.Hover(markdown, wordRange);
      }

      return null;
    } catch (error: any) {
      if (this.outputChannel) {
        this.outputChannel.appendLine(`Error providing hover: ${error.message}`);
      }
      return null;
    }
  }
}
