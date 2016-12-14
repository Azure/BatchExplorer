# BatchLabs
[![Build Status](https://travis-ci.org/Azure/BatchLabs.svg?branch=master)](https://travis-ci.org/Azure/BatchLabs)

**Note: this is in early development and there is no production build available.**

## Getting started
**Install node.js >= `6.9`**

Clone the repo `git clone https://github.com/Azure/BatchLabs`

Install the dependencies
```
npm install
npm install -g gulp (Optional)
```

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

## How to run the tests

| Description                              | Single run             | Watch                        |
|------------------------------------------|------------------------|------------------------------|
| Run the test for the browser environment | `npm run test-browser` | `npm run test-browser-watch` |
| Run the test for the node environemnt    | `npm run test-client`  | `npm run test-client-watch`  |
| Run all the tests                        | `npm run test`         |                              |
| Run the lint                             | `npm run lint`         |                              |

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
