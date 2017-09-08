import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import * as net from "net";
import * as path from "path";

import { Constants } from "../client-constants";
import { logger } from "../logger";
import { getPythonPath } from "./python-executable";

const asarPath = path.join(Constants.root, "../python-rpc/main");
const localPath = path.join(Constants.root, "python/main.py");
const logsFolder = Constants.logsFolder;

export class PythonRpcServerProcess {
    private _spawedProcess: ChildProcess;
    private _askForKill: boolean;
    /**
     * Start the python server
     * @returns Promise when the process has spawned
     */
    public start(): Promise<void> {
        this._askForKill = false;
        return this._getCommandLine().then((data) => {
            logger.info("Python path is", data.cmd, { args: data.args });
            const logStream = this._createLogFileStream();
            const child = this._spawedProcess = spawn(data.cmd, [...data.args]);
            child.stdout.pipe(logStream);
            child.stderr.pipe(logStream);
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

    private _getCommandLine(): Promise<{ cmd: string, args: string[] }> {
        if (Constants.isAsar) {
            return Promise.resolve({ cmd: asarPath, args: [] });
        } else {
            return getPythonPath().then(pythonPath => {
                return {
                    cmd: pythonPath,
                    args: [localPath],
                };
            });
        }
    }

    private _createLogFileStream(): fs.WriteStream {
        return fs.createWriteStream(path.join(logsFolder, "python-server.log"), { flags: "a" });
    }
}
