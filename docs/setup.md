# Setup your environment

The following are instructions for building and running Batch Explorer in a development environment.

1. Install dependencies:

    ```shell
    npm install
    npm run dev-setup
    pip install -r python/requirements.txt
    ```

2. Build the repository:

    ```shell
    npm run build
    ```

## Running Batch Explorer Desktop Application

```shell
npm run launch:desktop # Open the dev server, Electron app and all packages in watch mode
```

This command will enable hot reload for a better development experience. Simply saving a file will cause the UI to refresh with your changes.

*Note:* Changes to any files in the node client directory ('desktop/src/client') require restarting the application.

Please also take a look at the [coding guidelines](coding-guidelines.md) for this repo for best practices.

## Editor

If you're using VSCode (recommended) we suggest you use the following extensions:

* EditorConfig
* ESLint
* Prettier
* Markdownlint
* Stylelint

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
