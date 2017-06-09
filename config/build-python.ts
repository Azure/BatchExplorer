// tslint:disable:no-console
import * as path from "path";

import { Constants } from "../client/client-constants";
import { execCommand } from "../client/core";
import { getPythonPath } from "../client/python-process";

const setupPath = path.join(Constants.root, "python/setup.py");
getPythonPath().then((pythonPath) => {
    execCommand(`${pythonPath} ${setupPath} build`);
}).catch((errors) => {
    console.error(errors);
    process.exit(1);
});
