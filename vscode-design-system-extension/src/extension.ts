import * as vscode from 'vscode';
import { DesignSystemAPI, DEFAULT_REQUEST_TIMEOUT_MS } from './api';
import { CompletionProvider } from './completion';
import { HoverProvider } from './hover';
import { ColorDecorationProvider } from './colorDecoration';
import { CodeActionsProvider, buildTokenEdit, findTokenForValue, tokenImportPath } from './codeActions';
import { DIAGNOSTIC_LANGUAGES, HardcodedValueDiagnostics } from './diagnostics';
import { componentDocsUrl } from './docsUrl';
import { registerSnippets } from './snippets';
import { jsAccessor } from './tokenEdit';

let api: DesignSystemAPI;
let outputChannel: vscode.OutputChannel;
let diagnostics: HardcodedValueDiagnostics | undefined;

const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

function apiSettings() {
  const config = vscode.workspace.getConfiguration('designSystem');
  return {
    apiUrl: config.get<string>('apiUrl', DEFAULT_API_URL),
    apiKey: config.get<string>('apiKey', '').trim(),
    requestTimeout: config.get<number>('requestTimeout', DEFAULT_REQUEST_TIMEOUT_MS),
  };
}

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  outputChannel = vscode.window.createOutputChannel('Design System');
  outputChannel.appendLine('Design System extension is activating...');

  try {
    // Initialize API
    const config = vscode.workspace.getConfiguration('designSystem');
    const { apiUrl, apiKey, requestTimeout } = apiSettings();

    // Validate configuration
    if (!apiUrl || apiUrl.trim() === '') {
      outputChannel.appendLine('Warning: API URL not configured. Some features may not work.');
      vscode.window.showWarningMessage('Design System: API URL not configured. Please set designSystem.apiUrl in settings.');
    }

    if (!apiKey) {
      // Every API route needs a key, so without one tokens and components stay empty
      outputChannel.appendLine('Warning: designSystem.apiKey is not set. The API will answer 401 until it is.');
      vscode.window.showWarningMessage('Design System: set designSystem.apiKey to load tokens and components.');
    }

    api = new DesignSystemAPI(apiUrl, apiKey, outputChannel, { requestTimeout });

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

    registerSnippets(context, outputChannel);

    if (config.get<boolean>('enableDiagnostics', true)) {
      diagnostics = new HardcodedValueDiagnostics(api, tokenImportPath, outputChannel);
      context.subscriptions.push(diagnostics);
      outputChannel.appendLine('Hard-coded value diagnostics registered');
    }

    // Register code actions provider
    try {
      const codeActionsProvider = new CodeActionsProvider(api, outputChannel);
      const codeActionsDisposable = vscode.languages.registerCodeActionsProvider(
        DIAGNOSTIC_LANGUAGES.map(language => ({ scheme: 'file', language })),
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
          const { apiUrl, apiKey, requestTimeout } = apiSettings();
          api.updateConfig(apiUrl, apiKey, requestTimeout);
          diagnostics?.refreshAll();
          outputChannel.appendLine('Configuration updated');
          vscode.window.showInformationMessage('Design System configuration updated');
        }
      })
    );

    // Preload data in background
    api.getComponents().catch(err => {
      outputChannel.appendLine(`Warning: Failed to preload components: ${err.message}`);
    });
    api.getTokens().then(() => diagnostics?.refreshAll()).catch(err => {
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
            editor.edit(edit => edit.replace(editor.selection, jsAccessor(token.label)));
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
          const baseUrl = vscode.workspace.getConfiguration('designSystem').get<string>('docsBaseUrl', '');
          vscode.env.openExternal(vscode.Uri.parse(componentDocsUrl(baseUrl, component.label)));
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
        const matchingToken = findTokenForValue(tokens, selectedText);

        if (matchingToken) {
          const edit = buildTokenEdit(editor.document, selection, matchingToken);
          if (!edit) {
            vscode.window.showWarningMessage('The selected value is not in a string, template or stylesheet that can take a token');
            return;
          }
          const success = await vscode.workspace.applyEdit(edit);
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
        diagnostics?.refreshAll();
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
