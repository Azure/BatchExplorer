// tslint:disable:no-console
import * as path from "path";
import * as which from "which";
import { Constants } from "../../src/client/client-constants";
import { execCommand } from "../../src/client/core";
import { getPythonPath } from "../../src/client/python-process";

getPythonPath().then((pythonPath) => {
    console.log(pythonPath);
}).catch((errors) => {
    console.error(errors);
    process.exit(1);
});
