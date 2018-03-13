// tslint:disable:no-console
import "../../src/client/init";

import { initLogger } from "../../src/client/logger";
initLogger();

import * as path from "path";
import { Constants } from "../../src/client/client-constants";
import { execCommand } from "../../src/client/core";
import { getPythonPath } from "../../src/client/python-process/python-executable";

getPythonPath().then((pythonPath) => {
    console.log(pythonPath);
}).catch((errors) => {
    console.error(errors);
    process.exit(1);
});
