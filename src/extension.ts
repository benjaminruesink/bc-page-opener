import * as vscode from 'vscode';
import { BCCodeLensProvider } from './codeLensProvider';

type BusinessCentralObjectType = 'page' | 'table';

interface LaunchConfiguration {
    name?: string;
    type: string;
    tenant: string;
    environmentName: string;
    startupCompany?: string;
}

interface LaunchConfigurationFile {
    configurations?: LaunchConfiguration[];
}

interface ConfigQuickPickItem extends vscode.QuickPickItem {
    config: LaunchConfiguration;
}

export function activate(context: vscode.ExtensionContext) {
    const codeLensProvider = new BCCodeLensProvider();
    const selector: vscode.DocumentSelector = [
        { language: 'al' }
    ];
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(selector, codeLensProvider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bc-page-opener.openInBrowser', async (pageId?: string, objectType?: BusinessCentralObjectType) => {
            if (!pageId) {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('No active editor found');
                    return;
                }

                const detected = detectPageIdFromCursor(editor);
                if (!detected) {
                    vscode.window.showErrorMessage('No page ID found at cursor position or in current file. Place cursor on a page/table declaration line.');
                    return;
                }
                
                pageId = detected.id;
                objectType = detected.type;
            }
            
            try {
                await openPageInBrowser(pageId, objectType ?? 'page');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to open page: ${error}`);
            }
        })
    );
}

function detectPageIdFromCursor(editor: vscode.TextEditor): { id: string; type: BusinessCentralObjectType } | undefined {
    const document = editor.document;
    const position = editor.selection.active;
    
    const pagePattern = /^\s*(page)\s+(\d+)/i;
    const tablePattern = /^\s*(table)\s+(\d+)/i;
    const pageIdPropertyPattern = /^\s*(LookupPageID|DrillDownPageId)\s*=\s*(\d+)/i;
    
    const currentLine = document.lineAt(position.line);
    
    let match = pagePattern.exec(currentLine.text);
    if (match) {
        return { id: match[2], type: 'page' };
    }
    
    match = tablePattern.exec(currentLine.text);
    if (match) {
        return { id: match[2], type: 'table' };
    }

    match = pageIdPropertyPattern.exec(currentLine.text);
    if (match) {
        return { id: match[2], type: 'page' };
    }
    
    for (let i = position.line - 1; i >= Math.max(0, position.line - 50); i--) {
        const line = document.lineAt(i);
        
        match = pagePattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'page' };
        }
        
        match = tablePattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'table' };
        }

        match = pageIdPropertyPattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'page' };
        }
    }
    
    for (let i = position.line + 1; i < Math.min(document.lineCount, position.line + 20); i++) {
        const line = document.lineAt(i);
        
        match = pagePattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'page' };
        }
        
        match = tablePattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'table' };
        }

        match = pageIdPropertyPattern.exec(line.text);
        if (match) {
            return { id: match[2], type: 'page' };
        }
    }
    
    return undefined;
}

async function openPageInBrowser(pageId: string, objectType: BusinessCentralObjectType = 'page') {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    let launchConfig: LaunchConfigurationFile | undefined;
    
    // Try to read .vscode/launch.json first
    const launchJsonPath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'launch.json');
    try {
        const launchJsonContent = await vscode.workspace.fs.readFile(launchJsonPath);
        const launchJsonText = Buffer.from(launchJsonContent).toString('utf8');
        const cleanedJson = launchJsonText.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        launchConfig = JSON.parse(cleanedJson) as LaunchConfigurationFile;
    } catch (error) {
        // Fallback to user settings if launch.json doesn't exist or can't be read
        const userLaunchConfig = vscode.workspace.getConfiguration('launch');
        const configurations = userLaunchConfig.get<LaunchConfiguration[]>('configurations');
        if (Array.isArray(configurations) && configurations.length > 0) {
            launchConfig = { configurations: configurations };
        } else {
            vscode.window.showErrorMessage('Could not read launch configurations from .vscode/launch.json or user settings');
            return;
        }
    }

    const bcConfigs = launchConfig?.configurations?.filter((config) =>
        config.type === 'al' && config.tenant && config.environmentName
    );

    if (!bcConfigs || bcConfigs.length === 0) {
        vscode.window.showErrorMessage('No valid Business Central configurations found in launch.json');
        return;
    }

    const selectedConfig = await vscode.window.showQuickPick<ConfigQuickPickItem>(
        bcConfigs.map((config) => ({
            label: config.name ?? '',
            description: config.environmentName,
            config: config
        })),
        {
            placeHolder: 'Select Business Central environment'
        }
    );

    if (!selectedConfig) {
        return;
    }

    const config = selectedConfig.config;
    const { tenant, environmentName } = config;
    const company = config.startupCompany ? `&company=${encodeURIComponent(config.startupCompany)}` : '';
    const objectParam = objectType === 'table' ? 'table' : 'page';
    const url = `https://businesscentral.dynamics.com/${tenant}/${environmentName}?${objectParam}=${pageId}${company}`;

    await vscode.env.openExternal(vscode.Uri.parse(url));
}

export function deactivate() {}
