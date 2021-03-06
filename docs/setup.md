# Setup your environment

## 1. Prerequisites

Follow the **Building Batch Explorer yourself** instruction of the [wiki](https://github.com/Azure/BatchExplorer/wiki/Build-batch-explorer-yourself) in order to install all require dependencies.

Start the dev server

```bash
yarn dev-server
```

Start electron

```bash
# In the command line
yarn dev-electron

# In VSCode just press F5
```

The dev-server and dev-electron support hot reload for a better development experience. Simply saving a file will cause the UI to refresh to your updated changes.

*Note:* Changes to any files in the node client directory ('src/client') require restarting the application.

Please also take a look at the [coding guidelines](coding-guidelines.md) for this repo for best practices.

## Editor

If you're using VSCode (recommended) we suggest you use the following extensions:

* EditorConfig for VS Code(Important)
* TSLint
* Debugger for Chrome

## Detailed commands

**Magic command** (starts the server and electron in dev mode)

```shell
yarn dev
```

Build project

```shell
yarn build
```

Run app

```shell
yarn electron
```

Run watch (this will build files on save)

```shell
yarn watch
```

Run dev server (this will handle the refresh of files and later should have live reload)

```shell
yarn dev-server
```

Run dev electron (to use the dev server you need to run this)

```shell
yarn dev-electron
```
