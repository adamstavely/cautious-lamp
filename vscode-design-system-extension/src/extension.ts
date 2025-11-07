import * as vscode from 'vscode';
import { DesignSystemAPI } from './api';
import { CompletionProvider } from './completion';
import { HoverProvider } from './hover';
import { ColorDecorationProvider } from './colorDecoration';
import { CodeActionsProvider } from './codeActions';

let api: DesignSystemAPI;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  outputChannel = vscode.window.createOutputChannel('Design System');
  outputChannel.appendLine('Design System extension is activating...');

  try {
    // Initialize API
    const config = vscode.workspace.getConfiguration('designSystem');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api/v1');
    const apiKey = config.get<string>('apiKey', 'test-api-key-123');

    // Validate configuration
    if (!apiUrl || apiUrl.trim() === '') {
      outputChannel.appendLine('Warning: API URL not configured. Some features may not work.');
      vscode.window.showWarningMessage('Design System: API URL not configured. Please set designSystem.apiUrl in settings.');
    }

    api = new DesignSystemAPI(apiUrl, apiKey, outputChannel);

    // Register completion provider
    if (config.get<boolean>('enableAutocomplete', true)) {
      try {
        const completionProvider = new CompletionProvider(api, outputChannel);
        const completionDisposable = vscode.languages.registerCompletionItemProvider(
          [
            { scheme: 'file', language: 'javascript' },
            { scheme: 'file', language: 'typescript' },
            { scheme: 'file', language: 'vue' },
            { scheme: 'file', language: 'javascriptreact' },
            { scheme: 'file', language: 'typescriptreact' }
          ],
          completionProvider,
          '.', 'tokens', 'components'
        );
        context.subscriptions.push(completionDisposable);
        outputChannel.appendLine('Completion provider registered');
      } catch (error: any) {
        outputChannel.appendLine(`Error registering completion provider: ${error.message}`);
      }
    }

    // Register hover provider
    if (config.get<boolean>('enableHover', true)) {
      try {
        const hoverProvider = new HoverProvider(api, outputChannel);
        const hoverDisposable = vscode.languages.registerHoverProvider(
          [
            { scheme: 'file', language: 'javascript' },
            { scheme: 'file', language: 'typescript' },
            { scheme: 'file', language: 'vue' },
            { scheme: 'file', language: 'javascriptreact' },
            { scheme: 'file', language: 'typescriptreact' }
          ],
          hoverProvider
        );
        context.subscriptions.push(hoverDisposable);
        outputChannel.appendLine('Hover provider registered');
      } catch (error: any) {
        outputChannel.appendLine(`Error registering hover provider: ${error.message}`);
      }
    }

    // Register color decoration provider
    if (config.get<boolean>('enableColorPreview', true)) {
      try {
        const colorProvider = new ColorDecorationProvider(api, outputChannel);
        const colorDisposable = vscode.languages.registerColorProvider(
          [
            { scheme: 'file', language: 'javascript' },
            { scheme: 'file', language: 'typescript' },
            { scheme: 'file', language: 'vue' },
            { scheme: 'file', language: 'javascriptreact' },
            { scheme: 'file', language: 'typescriptreact' },
            { scheme: 'file', language: 'css' },
            { scheme: 'file', language: 'scss' }
          ],
          colorProvider
        );
        context.subscriptions.push(colorDisposable);
        outputChannel.appendLine('Color provider registered');
      } catch (error: any) {
        outputChannel.appendLine(`Error registering color provider: ${error.message}`);
      }
    }

    // Register code actions provider
    try {
      const codeActionsProvider = new CodeActionsProvider(api, outputChannel);
      const codeActionsDisposable = vscode.languages.registerCodeActionsProvider(
        [
          { scheme: 'file', language: 'javascript' },
          { scheme: 'file', language: 'typescript' },
          { scheme: 'file', language: 'vue' },
          { scheme: 'file', language: 'javascriptreact' },
          { scheme: 'file', language: 'typescriptreact' }
        ],
        codeActionsProvider,
        {
          providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }
      );
      context.subscriptions.push(codeActionsDisposable);
      outputChannel.appendLine('Code actions provider registered');
    } catch (error: any) {
      outputChannel.appendLine(`Error registering code actions provider: ${error.message}`);
    }

    // Register commands
    registerCommands(context);

    // Watch for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('designSystem')) {
          const config = vscode.workspace.getConfiguration('designSystem');
          const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api/v1');
          const apiKey = config.get<string>('apiKey', 'test-api-key-123');
          api.updateConfig(apiUrl, apiKey);
          outputChannel.appendLine('Configuration updated');
          vscode.window.showInformationMessage('Design System configuration updated');
        }
      })
    );

    // Preload data in background
    api.getComponents().catch(err => {
      outputChannel.appendLine(`Warning: Failed to preload components: ${err.message}`);
    });
    api.getTokens().catch(err => {
      outputChannel.appendLine(`Warning: Failed to preload tokens: ${err.message}`);
    });

    outputChannel.appendLine('Design System extension activated successfully');
  } catch (error: any) {
    outputChannel.appendLine(`Error activating extension: ${error.message}`);
    vscode.window.showErrorMessage(`Design System extension failed to activate: ${error.message}`);
  }
}

function registerCommands(context: vscode.ExtensionContext) {
  const insertComponentDisposable = vscode.commands.registerCommand(
    'designSystem.insertComponent',
    async () => {
      try {
        const components = await api.getComponents();
        if (components.length === 0) {
          vscode.window.showWarningMessage('No components available. Check your API connection.');
          return;
        }
        const component = await vscode.window.showQuickPick(
          components.map(c => ({ label: c.name, description: c.description, detail: c.id })),
          { placeHolder: 'Select a component to insert' }
        );
        if (component) {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            const snippet = await api.getComponentSnippet(component.label);
            if (snippet) {
              editor.insertSnippet(new vscode.SnippetString(snippet));
            } else {
              vscode.window.showWarningMessage(`No snippet available for ${component.label}`);
            }
          }
        }
      } catch (error: any) {
        outputChannel.appendLine(`Error inserting component: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to insert component: ${error.message}`);
      }
    }
  );
  context.subscriptions.push(insertComponentDisposable);

  const insertTokenDisposable = vscode.commands.registerCommand(
    'designSystem.insertToken',
    async () => {
      try {
        const tokens = await api.getTokens();
        if (tokens.length === 0) {
          vscode.window.showWarningMessage('No tokens available. Check your API connection.');
          return;
        }
        const token = await vscode.window.showQuickPick(
          tokens.map(t => ({ label: t.name, description: t.category, detail: t.value })),
          { placeHolder: 'Select a token to insert' }
        );
        if (token) {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            editor.insertSnippet(new vscode.SnippetString(`tokens.${token.label}`));
          }
        }
      } catch (error: any) {
        outputChannel.appendLine(`Error inserting token: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to insert token: ${error.message}`);
      }
    }
  );
  context.subscriptions.push(insertTokenDisposable);

  const openDocsDisposable = vscode.commands.registerCommand(
    'designSystem.openComponentDocs',
    async () => {
      try {
        const components = await api.getComponents();
        if (components.length === 0) {
          vscode.window.showWarningMessage('No components available. Check your API connection.');
          return;
        }
        const component = await vscode.window.showQuickPick(
          components.map(c => ({ label: c.name, description: c.description, detail: c.id })),
          { placeHolder: 'Select a component to view documentation' }
        );
        if (component) {
          const docsUrl = `http://localhost:5173/components/${component.label.toLowerCase()}`;
          vscode.env.openExternal(vscode.Uri.parse(docsUrl));
        }
      } catch (error: any) {
        outputChannel.appendLine(`Error opening docs: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to open documentation: ${error.message}`);
      }
    }
  );
  context.subscriptions.push(openDocsDisposable);

  const replaceTokenDisposable = vscode.commands.registerCommand(
    'designSystem.replaceWithToken',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('No active editor');
          return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText || selectedText.trim() === '') {
          vscode.window.showWarningMessage('Please select a value to replace');
          return;
        }

        const tokens = await api.getTokens();
        const matchingToken = tokens.find(t => {
          if (t.type === 'color' && selectedText.toLowerCase() === t.value.toLowerCase()) {
            return true;
          }
          if (t.type === 'spacing' && selectedText === t.value) {
            return true;
          }
          return false;
        });

        if (matchingToken) {
          const success = await editor.edit(editBuilder => {
            editBuilder.replace(selection, `tokens.${matchingToken.name}`);
          });
          if (success) {
            vscode.window.showInformationMessage(`Replaced with token: ${matchingToken.name}`);
          }
        } else {
          vscode.window.showWarningMessage('No matching token found for selected value');
        }
      } catch (error: any) {
        outputChannel.appendLine(`Error replacing token: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to replace token: ${error.message}`);
      }
    }
  );
  context.subscriptions.push(replaceTokenDisposable);

  const refreshCacheDisposable = vscode.commands.registerCommand(
    'designSystem.refreshCache',
    async () => {
      try {
        await api.refreshCache();
        vscode.window.showInformationMessage('Design System cache refreshed');
      } catch (error: any) {
        outputChannel.appendLine(`Error refreshing cache: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to refresh cache: ${error.message}`);
      }
    }
  );
  context.subscriptions.push(refreshCacheDisposable);

  const showOutputDisposable = vscode.commands.registerCommand(
    'designSystem.showOutput',
    () => {
      outputChannel.show();
    }
  );
  context.subscriptions.push(showOutputDisposable);
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine('Design System extension is deactivating...');
    outputChannel.dispose();
  }
}
