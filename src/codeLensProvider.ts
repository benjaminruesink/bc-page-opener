import * as vscode from 'vscode';

export class BCCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    private readonly pagePattern = /^\s*(page)\s+(\d+)/i;
    private readonly tablePattern = /^\s*(table)\s+(\d+)/i;
    private readonly pageIdPropertyPattern = /^\s*(LookupPageID|DrillDownPageId)\s*=\s*(\d+)/i;

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        
        if (document.languageId !== 'al') {
            return codeLenses;
        }

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;

            let match = this.pagePattern.exec(text);
            if (match) {
                const pageId = match[2];
                const range = new vscode.Range(i, 0, i, text.length);
                const command: vscode.Command = {
                    title: `Open page ${pageId} in browser`,
                    command: 'bc-page-opener.openInBrowser',
                    arguments: [pageId, 'page']
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }

            match = this.tablePattern.exec(text);
            if (match) {
                const tableId = match[2];
                const range = new vscode.Range(i, 0, i, text.length);
                const command: vscode.Command = {
                    title: `Open table ${tableId} in browser`,
                    command: 'bc-page-opener.openInBrowser',
                    arguments: [tableId, 'table']
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }

            match = this.pageIdPropertyPattern.exec(text);
            if (match) {
                const pageId = match[2];
                const range = new vscode.Range(i, 0, i, text.length);
                const command: vscode.Command = {
                    title: `Open page ${pageId} in browser`,
                    command: 'bc-page-opener.openInBrowser',
                    arguments: [pageId, 'page']
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }
        }

        return codeLenses;
    }

    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}
