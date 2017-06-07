import { ChildProcess, spawn } from "child_process";
import * as path from "path";

import { Constants } from "../client-constants";
import { logger } from "../logger";
import { getPythonPath } from "./python-executable";

const asarPath = path.join(Constants.root, "../app.asar.unpacked/python/main.py");
const localPath = path.join(Constants.root, "python/main.py");
const pythonFile = Constants.isAsar ? asarPath : localPath;
logger.info("Python path is", pythonFile);

export class PythonRpcServerProcess {
    private _spawedProcess: ChildProcess;
    /**
     * Start the python server
     * @returns Promise when the process has spawned
     */
    public start(): Promise<void> {
        return getPythonPath().then((pythonPath) => {
            this._spawedProcess = spawn(pythonPath, [pythonFile]);
            logger.info("Python Rpc server started!");
        });
    }

    public stop() {
        if (this._spawedProcess) {
            this._spawedProcess.kill();
            logger.info("Python Rpc server stopped!");
        }
    }

    public restart() {
        this.stop();
        this.start();
    }
}
