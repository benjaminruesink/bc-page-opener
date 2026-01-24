# Business Central Object Opener

A Visual Studio Code extension that enables developers to open Business Central pages and tables directly from AL files in their browser. Quickly navigate from code to the live web client with a single click.

## Usage

### Method 1: CodeLens (Recommended)

1. Open any AL file containing page or table declarations
2. Click the CodeLens link displayed above the declaration line
3. Select your target environment from the quick pick menu
4. The page/table opens in your default browser

### Method 2: Command Palette

1. Place your cursor anywhere in an AL file
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type **`BCO`** and select "BCO: Open in Browser"
4. The extension automatically detects the nearest page or table number
5. Select your target environment

## Configuration

The extension reads Business Central configurations from (in priority order):

1. **Workspace settings**: `.vscode/launch.json` (preferred)
2. **User settings**: VS Code `launch.configurations` settings (fallback)

Each configuration must have:

- `type`: "al"
- `tenant`: Your Business Central tenant ID
- `environmentName`: Target environment name
- `startupCompany`: Company name (optional)

**Example launch.json:**
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Sandbox - Development",
            "type": "al",
            "environmentType": "Sandbox",
            "environmentName": "Sandbox-Development",
            "tenant": "00000000-0000-0000-0000-000000000000",
            "startupCompany": "CRONUS International Ltd."
        }
    ]
}
```

## Features

- **CodeLens links** above page and table declarations for one-click opening
- **Automatic detection** of page/table numbers from:
  - Page declarations (`page 50100`)
  - Table declarations (`table 50101`)
  - LookupPageID and DrillDownPageId properties
- **Multiple environments**: Select target environment from your workspace configurations
- **Flexible configuration**: Uses workspace launch.json or user settings

## How It Works

The extension scans AL files for object declarations and generates CodeLens links. When clicked, it:

1. Reads environment configurations from workspace `launch.json`
2. Constructs the appropriate Business Central URL
3. Opens the URL in your default browser

URL format:
```
https://businesscentral.dynamics.com/{tenant}/{environmentName}?page={pageId}&company={companyName}
```

## Troubleshooting

**CodeLens not appearing:**
- Verify the file has an `.al` extension
- Ensure CodeLens is enabled in VS Code settings: `"editor.codeLens": true`
- Check that valid page or table declarations exist in the file

**Error: "Could not read launch configurations":**
- Confirm `.vscode/launch.json` exists in your workspace, or
- Add launch configurations to your VS Code user settings
- Validate JSON syntax (remove trailing commas)

**Error: "No valid Business Central configurations found":**
- Ensure at least one configuration has `type: "al"`, `tenant`, and `environmentName`

## Known Issues

CodeLens text may not appear when the AL Test Runner extension is installed due to overlapping document selectors. The CodeLens functionality still works, or you can use the Command Palette method (`Ctrl+Shift+P` → `BCO`).