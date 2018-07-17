# BatchExplorer
[![Build Status](https://travis-ci.org/Azure/BatchExplorer.svg?branch=master)](https://travis-ci.org/Azure/BatchExplorer)
[![codecov](https://codecov.io/gh/Azure/BatchExplorer/branch/master/graph/badge.svg)](https://codecov.io/gh/Azure/BatchExplorer)

**Note: BatchExplorer is in preview.**

Batch Explorer is a tool to manage your Azure Batch accounts. The goal is to implement a great user experience that will help you debug, monitor and manage your pools, jobs and tasks.
It will also include experimental features such as `Batch Templates` in the aim to improve your Batch experience. We are open to any feedback, ideas and contributions you might have.

BatchExplorer is updated monthly with new features and bug fixes. You can download it for Windows, macOS, and Linux on [Batch Explorer website](https://azure.github.io/BatchExplorer/).

![](docs/images/job-home.png)

## Downloads

You can download the latest version at https://github.com/Azure/BatchExplorer/releases

## Building BatchExplorer yourself
#### 1. Prerequisites
- **Install node.js version `8` or greater. [Download](https://nodejs.org/en/download/)**
- Install python **3.6** (doesn't need to be in the path if that breaks your environment)

#### 2. Clone the repo
- At stable branch `git clone -b stable https://github.com/Azure/BatchExplorer`
- Or for the latest changes `git clone https://github.com/Azure/BatchExplorer`

Move to the directory `cd BatchExplorer`

#### 3. Build the app with all in one command line(Windows only)
Call this command and it will check you have everything setup correctly and build the app.
```
.\scripts\install\install-windows
```
**You can skip all the other steps**

#### 4. Install the dependencies
```bash
npm install
pip3 install -r python/requirements.txt # or pip if on windows or only have python 3.6 installed
```

#### 4.5 Setup some configuration(Only in certain case)
If you didn't installed python in the path you will need to let BatchExplorer know where it is.
Set an environment variable called `BL_PYTHON_PATH` with that path to the python executable.
BatchExplorer will look first to see if this environment variable is set if not try `python3` and then `python` to find an installation of python 3.6

#### 5. Build and run the application
```bash
# Make an executable, this will bundle all needed dependencies including node and python
npm run build-and-pack

# Manual
npm run build:prod
npm run electron:prod

# To debug errors
npm run build
npm run electron
```

## Feedback
* Request a new feature on [GitHub](https://github.com/Azure/BatchExplorer/issues)
* Vote for popular [feature requests](https://github.com/Azure/BatchExplorer/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+label%3Afeature+sort%3Areactions-%2B1-desc+)
* File a bug on [GitHub](https://github.com/Azure/BatchExplorer/issues)

## Developers
[Dev docs](docs/readme.md)

## License
Copyright (c) Microsoft Corporation. All rights reserved.

Batch Explorer is licensed under MIT [See license](LICENSE)
Some icons are under Creative Commons Attribution-ShareAlike 3.0 Unported [See license](app/assets/images/logos/LICENSE)
