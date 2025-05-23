# Setup your environment

The following are instructions for building and running Batch Explorer in a development environment.

1. Check prerequisites

    Make sure the following are installed:

    - Node.js LTS
    - Powershell 7+

    **On Windows:**

    Make sure Node.js is [configured to use the Visual Studio Build Tools](https://github.com/nodejs/node-gyp#on-windows).

    Next, ensure that long path support is enabled in the registry by running the following command as administrator in a PowerShell console:

    ```shell
    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
    ```

    Also enable Git's long path support:

    ```shell
    git config --global core.longpaths true
    ```

2. Install dependencies:

    ```shell
    npm install
    npm run dev-setup
    ```

3. Build the repository:

    ```shell
    npm run build
    ```

## Run Batch Explorer in dev mode

```shell
npm run launch:desktop # Open the dev server, Electron app and all packages in watch mode
```

This command will enable hot reload for a better development experience. Simply saving a file will cause the UI to refresh with your changes.

*Note:* Changes to any files in the node client directory ('desktop/src/client') require restarting the application.

Please also take a look at the [coding guidelines](coding-guidelines.md) for this repo for best practices.

In developer-mode, Batch Explorer starts with Chrome Developer Tools (DevTools) opened in "undocked" mode. To open DevTools in another mode, set the `DEV_TOOLS_MODE` environment variables. The allowed values are "left", "right", "bottom", "undocked", and "detach".

**Linux shells:**

```bash
DEV_TOOLS_MODE=right npm run launch:desktop
```

**Powershell:**

```powershell
$Env:DEV_TOOLS_MODE = "right"
npm run launch:desktop
```

## Editor

If you're using VSCode (recommended) we suggest you use the following extensions:

- EditorConfig
- ESLint
- Prettier
- Markdownlint
- Stylelint

## Other useful commands

Run everything except for the Electron shell in watch mode:

```shell
npm run start:desktop
```

Run **only** the Electron shell in watch mode*:

```shell
npm run launch:dev-electron
```

Start the experimental web UI in watch mode:

```shell
npm run start:web
```
