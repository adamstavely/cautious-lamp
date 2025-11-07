import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';

// Color decoration provider using DocumentColorProvider API
export class ColorDecorationProvider implements vscode.DocumentColorProvider {
  constructor(
    private api: DesignSystemAPI,
    private outputChannel?: vscode.OutputChannel
  ) {}

  async provideDocumentColors(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.ColorInformation[]> {
    try {
      const colors: vscode.ColorInformation[] = [];
      const text = document.getText();
      const colorRegex = /#[0-9a-fA-F]{6}/gi;
      let match;

    while ((match = colorRegex.exec(text)) !== null && !token.isCancellationRequested) {
      const position = document.positionAt(match.index);
      const colorValue = match[0];
      
      try {
        // Convert hex to RGB for vscode.Color
        const r = parseInt(colorValue.substr(1, 2), 16) / 255;
        const g = parseInt(colorValue.substr(3, 2), 16) / 255;
        const b = parseInt(colorValue.substr(5, 2), 16) / 255;
        
        const colorInfo: vscode.ColorInformation = {
          range: new vscode.Range(position, position.translate(0, 7)),
          color: new vscode.Color(r, g, b, 1)
        };
        
        colors.push(colorInfo);
      } catch (error) {
        // Skip invalid colors
      }
    }

      return colors;
    } catch (error: any) {
      if (this.outputChannel) {
        this.outputChannel.appendLine(`Error providing color decorations: ${error.message}`);
      }
      return [];
    }
  }

  async provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range },
    token: vscode.CancellationToken
  ): Promise<vscode.ColorPresentation[]> {
    // Convert RGB to hex
    const r = Math.round(color.red * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.green * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.blue * 255).toString(16).padStart(2, '0');
    const hex = `#${r}${g}${b}`.toUpperCase();

    return [
      {
        label: hex,
        textEdit: {
          range: context.range,
          newText: hex
        }
      }
    ];
  }
}

