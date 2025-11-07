import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';

export class HoverProvider implements vscode.HoverProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    try {
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return null;
      }

      const word = document.getText(wordRange);
      const lineText = document.lineAt(position.line).text;

    // Check for token usage
    if (lineText.includes('tokens.') || lineText.includes('token.')) {
      const token = await this.api.getToken(word);
      if (token) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 🎨 ${token.name}\n\n`);
        markdown.appendMarkdown(`**Value:** \`${token.value}\`\n\n`);
        markdown.appendMarkdown(`**Category:** ${token.category}\n\n`);
        markdown.appendMarkdown(`**Type:** ${token.type}\n\n`);
        if (token.description) {
          markdown.appendMarkdown(`${token.description}\n\n`);
        }
        
        // Add color preview for color tokens
        if (token.type === 'color' && /^#[0-9a-fA-F]{6}$/i.test(token.value)) {
          markdown.appendMarkdown(`![Color](${token.value})\n\n`);
        }

        return new vscode.Hover(markdown, wordRange);
      }
    }

    // Check for component usage
    const component = await this.api.getComponent(word);
    if (component) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`### 🧩 ${component.name}\n\n`);
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

    // Check for hardcoded color values
    const colorMatch = word.match(/^#[0-9a-fA-F]{6}$/i);
    if (colorMatch) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`### 🎨 Color Value\n\n`);
      markdown.appendMarkdown(`**Value:** \`${word}\`\n\n`);
      markdown.appendMarkdown(`💡 Consider using a design token instead of hardcoded colors.\n\n`);
      markdown.appendMarkdown(`*Right-click to replace with token*`);
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

