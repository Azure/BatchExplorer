# BatchLabs
[![Build Status](https://travis-ci.org/Azure/BatchLabs.svg?branch=master)](https://travis-ci.org/Azure/BatchLabs)

**Note: this is in early development and there is no production build available.**

## Getting started
**Install node.js version `6.9` or greater.**

#### 1. Clone the repo
- At stable branch `git clone -b stable https://github.com/Azure/BatchLabs`
- Or for the latest changes `git clone https://github.com/Azure/BatchLabs`

#### 2. Install the dependencies
```
npm install
npm install -g gulp (Optional)
```

#### 3. Build and run the application
```
npm run build
npm run electron
```

## Developers
[Dev docs](docs/readme.md)

For developers, you can set up a development environment as follows:

Start the dev server
```
npm run dev-server
```

Start electron
```
// In the command line
npm run dev-electron

// In VSCode just press F5
```

The dev-server and dev-electron support hot reload for a better development experience. Simply saving a file will cause the UI to refresh to your updated changes.

*Note:* Changes to any files in the node client directory ('\client\') require restarting the application.

If you're using VSCode (recommended) we suggest you use the following extensions:
* Debugger for Chrome
* EditorConfig for VS Code
* TSLint

Please also take a look at the [coding guidelines](coding-guidelines.md) for this repo for best practices.

## Testing

[Testing doc](docs/testing.md)

## Editor

In vscode install the editorconfig extension

## Detailed commands:
**Magic command(Starts the server and electron in dev mode)**
```
npm run dev
```

Build project
```
npm run build
```

Run app
```
npm run electron
```

Run watch(This will build files on save)
```
npm run watch
```

Run dev server(This will handle the refresh of files and later should have live reloead)
```
npm run dev-server
```

Run dev electron(To use the dev server you need to run this)
```
npm run dev-electron
```
