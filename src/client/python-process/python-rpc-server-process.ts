import { log } from "@batch-flask/utils";
import { ChildProcess, spawn } from "child_process";
import * as path from "path";
import { Constants } from "../client-constants";
import { pythonLogger } from "../logger";
import { getPythonPath } from "./python-executable";

const asarPath = path.join(Constants.root, "../python-rpc/main");
const localPath = path.join(Constants.root, "python/main.py");
const portPromise = process.env.HOT ? Constants.pythonServerPort.dev : Constants.pythonServerPort.prod;

export class PythonRpcServerProcess {
    public port: Promise<number> = portPromise;

    private _spawedProcess: ChildProcess;
    private _askForKill: boolean;
    /**
     * Start the python server
     * @returns Promise when the process has spawned
     */
    public async start(): Promise<void> {
        this._askForKill = false;
        const data = await this._getCommandLine();
        if (!data) {
            log.info("Couldn't start the python server!");
            return;
        }
        log.info(`Python path is: '${data.cmd}', Args: ${data.args}`);
        const child = this._spawedProcess = spawn(data.cmd, [...data.args], {
            env: {
                ...process.env,
                PYTHONUNBUFFERED: "1",
            },
        });
        pythonLogger.info("========================= STARTING PYTHON RPC SERVER PROCESS =========================");

        child.stdout.on("data", (data) => {
            pythonLogger.info(data.toString());
        });

        child.stderr.on("data", (data) => {
            pythonLogger.info(data.toString());
        });

        child.on("message", (message) => {
            log.info("Message from python", message);
        });

        child.on("disconnect", (...args) => {
            log.error("Disconnected python backend", args);
        });

        child.on("exit", (code) => {
            if (this._askForKill) {
                log.info("Python rpc server has stopped!");
            } else {
                log.error(`Python Rpc server has exited unexpectedly with code! ${code}`);
            }
        });

        child.on("error", (e) => {
            log.error("Error with python server", e);
        });
        log.info("Python Rpc server started!");
    }

    public stop() {
        if (this._spawedProcess) {
            this._askForKill = true;
            log.info("Stopping python rpc server!");
            this._spawedProcess.kill();
        }
    }

    public async restart() {
        this.stop();
        return this.start();
    }

    private async _getCommandLine(): Promise<{ cmd: string, args: string[] } | null> {
        const port = await portPromise;
        const portStr = port.toString();

        if (Constants.isAsar) {
            return { cmd: asarPath, args: [portStr] };
        } else {
            const pythonPath = await getPythonPath();
            if (!pythonPath) { return null; }
            return {
                cmd: pythonPath,
                args: [localPath, portStr],
            };
        }

    }
}
