import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SNIPPET_FILES, SnippetDefinition, parseSnippets } from './snippetData';

/**
 * Offers the snippets in snippets/ as completions. They're registered here
 * rather than under `contributes.snippets` so `designSystem.enableSnippets`
 * can turn them off; the setting is read on every request, so it applies
 * without a reload.
 */
export function registerSnippets(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
  const byLanguage = new Map<string, SnippetDefinition[]>();
  for (const [language, file] of Object.entries(SNIPPET_FILES)) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(context.extensionPath, 'snippets', file), 'utf8'));
      byLanguage.set(language, parseSnippets(json));
    } catch (error: any) {
      outputChannel.appendLine(`Error loading snippets/${file}: ${error.message}`);
    }
  }

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document) {
      if (!vscode.workspace.getConfiguration('designSystem').get<boolean>('enableSnippets', true)) return [];
      return (byLanguage.get(document.languageId) ?? []).map(snippet => {
        const item = new vscode.CompletionItem(snippet.prefix, vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString(snippet.body);
        item.detail = snippet.description;
        item.documentation = new vscode.MarkdownString().appendCodeblock(snippet.body);
        return item;
      });
    }
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      Object.keys(SNIPPET_FILES).map(language => ({ language })),
      provider
    )
  );
  outputChannel.appendLine('Snippets registered');
}
