# BatchLabs
[![Build Status](https://travis-ci.org/Azure/BatchLabs.svg?branch=master)](https://travis-ci.org/Azure/BatchLabs)

**Note: BatchLabs is in beta. We don't provide any installer/packaged binaries as of now. You will need to build this app yourself.**

This is the readme for master branch is contains the latest changes. Stable might be slightly different [Stable readme](https://github.com/Azure/BatchLabs/tree/stable)

## Getting started
#### 1. Prerequisites
- **Install node.js version `6.9` or greater. [Download](https://nodejs.org/en/download/)**
- Install yarn `npm install -g yarn`

#### 2. Clone the repo
- At stable branch `git clone -b stable https://github.com/Azure/BatchLabs`
- Or for the latest changes `git clone https://github.com/Azure/BatchLabs`

#### 3. Install the dependencies
```bash
yarn install
```
Note: You can also use `npm install` at your own risk. However please do not submit an issue if you didn't use `yarn install`. Yarn will make sure you have the exact same set of dependencies as everybody which remove any unexpected third party bugs problems.

#### 4. Build and run the application
```bash
# Make an executable
npm run build-and-pack

# Manual
npm run build:prod
npm run electron:prod

# To debug errors
npm run build
npm run electron
```

## Developers
[Dev docs](docs/readme.md)

For developers, you can set up a development environment as follows:
**Use `yarn install` instead of `npm install` this will makes sure everybody has the same exact set of depenencies [Migrating from npm to yarn](https://yarnpkg.com/lang/en/docs/migrating-from-npm/)**

Start the dev server
```bash
npm run dev-server
```

Start electron
```bash
# In the command line
npm run dev-electron

# In VSCode just press F5
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

## License

Batch labs is licensed under MIT [See license](LICENSE)
Some icons are under Creative Commons Attribution-ShareAlike 3.0 Unported [See license](app/assets/images/logos/LICENSE)
