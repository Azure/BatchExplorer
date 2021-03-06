// eslint-disable no-console
/**
 * This script will run the command "python setup.py build" to build the python
 * but ensure it is using a valid version of python to do so.
 */
import * as path from "path";

import { Constants } from "../src/client/client-constants";
import { execCommand } from "../src/client/core";
import { getPythonPath } from "../src/client/python-process";

const setupPath = path.join(Constants.root, "python/setup.py");
getPythonPath().then((pythonPath) => {
    // Run "python setup.py build"
    execCommand(`${pythonPath} ${setupPath} build`);
}).catch((errors) => {
    console.error(errors);
    process.exit(1);
});
