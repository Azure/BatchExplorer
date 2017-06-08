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
    private _askForKill: boolean;
    /**
     * Start the python server
     * @returns Promise when the process has spawned
     */
    public start(): Promise<void> {
        this._askForKill = false;
        return getPythonPath().then((pythonPath) => {
            const child = this._spawedProcess = spawn(pythonPath, ["pythonFile"]);
            child.on("exit", (code) => {
                if (this._askForKill) {
                    logger.info("Python rpc server has stopped!");
                } else {
                    logger.error("Python Rpc server has exited unexpectedly with code!", code);
                }
            });
            logger.info("Python Rpc server started!");
        });
    }

    public stop() {
        if (this._spawedProcess) {
            this._askForKill = true;
            logger.info("Stopping python rpc server!");
            this._spawedProcess.kill();
        }
    }

    public restart() {
        this.stop();
        this.start();
    }
}
