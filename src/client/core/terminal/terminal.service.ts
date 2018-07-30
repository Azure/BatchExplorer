import { Injectable } from "@angular/core";
import { OSService } from "@batch-flask/ui/electron";
import * as cp from "child_process";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { ExternalApplication, IpcEvent } from "common/constants";
import { FileSystem } from "../fs";

interface TerminalDefinition {
    process: string;
    args: string[];
}

export enum SupportedTerminal {
    Powershell = "powershell",
    Cmd = "cmd",
    XTerminalEmulator = "x-terminal-emulator",
    GnomeTerminal = "gnome-terminal",
    Konsole = "konsole",
    XTerm = "xterm",
    TerminalApp = "Terminal.app",
}
const supportedTerminals: {[key in SupportedTerminal]: TerminalDefinition} = {
    [SupportedTerminal.Powershell]: {
        process: "cmd.exe",
        args: ["/c", "start", "powershell", "-NoExit", "-Command", "{command}"],
    },
    [SupportedTerminal.Cmd]: {
        process: "cmd.exe",
        args: ["/c", "start", "cmd", "/k", "{command}"],
    },
    [SupportedTerminal.XTerminalEmulator]: {
        process: "x-terminal-emulator",
        args: ["-e", "{command}; bash"],
    },
    [SupportedTerminal.GnomeTerminal]: {
        process: "gnome-terminal",
        args: ["-e", "{command}; bash"],
    },
    [SupportedTerminal.Konsole]: {
        process: "konsole",
        args: ["-e", "{command}; bash"],
    },
    [SupportedTerminal.XTerm]: {
        process: "xterm",
        args: ["-e", "{command}; bash"],
    },
    [SupportedTerminal.TerminalApp]: {
        process: "osascript",
        args: [
            "-e",
            'tell application "Terminal" to do script "{command}"',
            "-e",
            'tell application "Terminal" to activate',
        ],
    },
};

@Injectable()
export class TerminalService {
    public _serviceBrand: any;

    constructor(
        private osService: OSService,
        private fs: FileSystem,
        ipcMain: BlIpcMain,
    ) {
        ipcMain.on(IpcEvent.launchApplication, ({name, args}) => {
            if (name === ExternalApplication.terminal) {
                return this.runInTerminal(args.command);
            }
        });
    }

    public runInTerminal(command: string, terminal?: string, envVars?: StringMap<string>): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            let myTerminal;

            // check if the user provided a the name of a supported terminal application
            if (terminal && (terminal in supportedTerminals)) {
                myTerminal = supportedTerminals[terminal];
            } else {
                // otherwise, use the OS default
                myTerminal = await this._getDefaultTerminalByOS();
            }

            // make a deep copy of myTerminal so we don't overwrite the defaults
            myTerminal = JSON.parse(JSON.stringify(myTerminal));

            // replace the command template with the actual command to be run in the terminal window
            myTerminal.args = this._formatCommand(myTerminal.args, command);

            // merge environment variables into a copy of the process.env
            const env = envVars ? {...process.env, ...envVars} : process.env;

            // delete environment variables that have a null value
            Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);

            const options: cp.SpawnOptions = {
                env: env,
                windowsVerbatimArguments: true,
                detached: true,
            };

            // spawn the terminal process with the given arguments
            const cmd = cp.spawn(myTerminal.process, myTerminal.args, options);

            cmd.once("error", (error) => {
                reject(error);
            });

            if (cmd.pid) {
                resolve(cmd.pid);
            }
        });
    }

    /**
     * Determine the user's OS and return the correct default terminal
     */
    private async _getDefaultTerminalByOS(): Promise<any> {
        if (this.osService.isWindows()) {           // return powershell for windows
            return supportedTerminals["powershell"];
        } else if (this.osService.isLinux()) {      // get the default linux system terminal, and use it
            return this._getDefaultTerminalLinux();
        } else {                                 // return Terminal.app for macOS
            return supportedTerminals["Terminal.app"];
        }
    }

    private async _getDefaultTerminalLinux(): Promise<any> {
        const isDebian = await this.fs.exists("/etc/debian_version");

        if (isDebian) {
            return supportedTerminals["x-terminal-emulator"];
        } else if (process.env.DESKTOP_SESSION === "gnome"
                || process.env.DESKTOP_SESSION === "gnome-classic") {
            return supportedTerminals["gnome-terminal"];
        } else if (process.env.DESKTOP_SESSION === "kde-plasma") {
            return supportedTerminals["konsole"];
        } else if (process.env.COLORTERM || process.env.TERM) {
            return {
                process: process.env.COLORTERM || process.env.TERM,
                args: ["-e", "{command}; bash"],
            };
        } else {
            return supportedTerminals["xterm"];
        }
    }

    private _formatCommand(args: string[], command: string): string[] {
        return args.map(arg => {
            if (!arg.includes("{command}")) {
                return arg;
            } else {
                return arg.format({command});
            }
        });
    }
}
