# Azure Batch Shared User Interface Libraries

This directory contains Typescript libraries intended for use across various Batch UIs. These packages depend on each other and can be built together using the scripts inside the root package.json.

## Package Layout

These libraries consist of various NPM packages which are meant to be distributed (in the `packages/` directory), along with private utility packages which are for development only (in the `util/` directory).

- `packages/common` - A common package intended to be able to run in a Node.js environment as well as a web browser environment. Has minimal external dependencies, and provides various core functions and interfaces such as:

    - A common HTTP layer which wraps specific implementations of HTTP auth and transport (such as the Azure Portal's `batch()` API for sending/receiving multiple logical HTTP requests in a single request/response)
    - A reactive data layer for forms, intended to act as a view model for a form UI

- `packages/react` - A React-based component package specifically designed to be deployed in an Azure Portal ReactView blade. Its peerDependencies are tailored toward a specific version of the Azure Portal SDK, and should be kept up to date with the version of the SDK that we are targeting. This packages builds a small AMD-compatible file which excludes any dependencies which the Azure Portal already provides such as React, FluentUI and Redux.

- `packages/standalone` - A package targeted for deployment in a web browser. Builds a single Javascript bundle which contains all of its required dependencies, and includes any UI components which do not make sense in the portal, such as those for top-level navigation, authentication, etc.

## Development Prerequisites

Before developing against these libraries, make sure you have installed:

- [Node.js](https://nodejs.org) 14 or higher
- [Yarn](https://classic.yarnpkg.com) 1.2 stable (**not** Yarn 2.x)

## Building and Running Tests

To build the shared libraries, run the following from the same directory as this README.md:

```shell
yarn install && yarn build:clean
```

## Unit Tests

Unit tests are automatically run via [Jest](https://jestjs.io/) when invoking any `build` script. To develop tests live, `cd` to the package's directory (for example `packages/common`) then run the command:

```shell
yarn test:watch
```

This will start Jest in an interactive mode and watch the source code for changes, rebuilding and rerunning tests automatically.

To set breakpoints and debug tests, run `yarn test:debug`, then open Edge or Chrome and go to [edge://inspect](edge://inspect) or [chrome://inspect](edge://inspect) respectively. This should auto-detect the running Node.js debugger port, and allow you to connect the Chromium dev tools. Note that when the debugger connects, execution will have already been paused. To resume, click the play button in your debugger.

## Developing in a Local Web Server

To start a development server and watch for changes, `cd` to the `packages/standalone` directory and run the following command:

```shell
yarn start
```

This will start a webpack dev server at <http://127.0.0.1:9000> and watch for any changes to the `standalone` package. To pick up live changes from other packages, run `yarn watch` either from the same directory as this README.md, or from the individual package directory.
