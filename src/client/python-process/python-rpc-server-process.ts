import { ChildProcess, spawn } from "child_process";
import * as path from "path";

import { Constants } from "../client-constants";
import { logger, pythonLogger } from "../logger";
import { getPythonPath } from "./python-executable";

const asarPath = path.join(Constants.root, "../python-rpc/main");
const localPath = path.join(Constants.root, "python/main.py");

export class PythonRpcServerProcess {
    private _spawedProcess: ChildProcess;
    private _askForKill: boolean;
    /**
     * Start the python server
     * @returns Promise when the process has spawned
     */
    public async start(): Promise<void> {
        this._askForKill = false;
        return this._getCommandLine().then((data) => {
            logger.info("Python path is", data.cmd, { args: data.args });
            const child = this._spawedProcess = spawn(data.cmd, [...data.args]);
            pythonLogger.info("========================= STARTING PYTHON RPC SERVER PROCESS =========================");

            child.stdout.on("data", (data) => {
                pythonLogger.info(data.toString());
            });

            child.stderr.on("data", (data) => {
                pythonLogger.error(data.toString());
            });

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

    public async restart() {
        this.stop();
        return this.start();
    }

    private async _getCommandLine(): Promise<{ cmd: string, args: string[] }> {
        const portPromise = process.env.HOT ? Constants.pythonServerPort.dev : Constants.pythonServerPort.prod;

        return portPromise.then((port) => {
            const portStr = port.toString();
            if (Constants.isAsar) {
                return { cmd: asarPath, args: [portStr] };
            } else {
                return getPythonPath().then(pythonPath => {
                    return {
                        cmd: pythonPath,
                        args: [localPath, portStr],
                    };
                });
            }
        });

    }
}
