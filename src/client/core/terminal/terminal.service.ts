import { OSService } from "@batch-flask/ui/electron";
import * as cp from "child_process";
import { FileSystem } from "../fs";

const supportedTerminals = {
    powershell: {
        proc: "cmd.exe",
        args: ['/c', 'start', 'powershell', '-NoExit', '-Command', '{command}'],
    },
    cmd: {
        proc: "cmd.exe",
        args: ['/c', 'start', 'cmd', '/k', '{command}'],
    },
    linux: {
        proc: "{terminal}",
        args: ['-e', '{command}; bash'],
    },
    macTerminal: {
        proc: "osascript",
        args: ['-e', 'tell application "Terminal" to do script "{command}"', '-e', 'tell application "Terminal" to activate'],
    },
};

export class TerminalService {
    public _serviceBrand: any;

    constructor(
        private osService: OSService,
        private fs: FileSystem,
    ) {}

    public runInTerminal(command: string, terminal?: string, envVars?: StringMap<string>): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let myTerminal;

            // check if the user provided a the name of a supported terminal application
            if (terminal && (terminal in supportedTerminals)) {
                myTerminal = await Promise.resolve(supportedTerminals[terminal]);
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
            const cmd = cp.spawn(myTerminal.proc, myTerminal.args, options);
            cmd.on("error", reject);

            resolve(null);
        });
    }

    /**
     * Determine the user's OS and return the correct default terminal
     */
    private async _getDefaultTerminalByOS(): Promise<any> {
        if (this.osService.isWindows()) {           // return powershell for windows
            return supportedTerminals.powershell;
        } else if (this.osService.isLinux()) {      // get the default linux system terminal, and use it
            const terminal = await this._getDefaultTerminalLinux();
            const myTerminal = supportedTerminals.linux;
            myTerminal.proc = myTerminal.proc.format({terminal});
            return myTerminal;
        } else {                                 // return Terminal.app for macOS
            return supportedTerminals.macTerminal;
        }
    }

    private async _getDefaultTerminalLinux(): Promise<string> {
        const isDebian = await this.fs.exists("/etc/debian_version");

        if (isDebian) {
            return "x-terminal-emulator";
        } else if (process.env.DESKTOP_SESSION === "gnome"
                || process.env.DESKTOP_SESSION === "gnome-classic") {
            return "gnome-terminal";
        } else if (process.env.DESKTOP_SESSION === "kde-plasma") {
            return "konsole";
        } else if (process.env.COLORTERM) {
            return process.env.COLORTERM;
        } else if (process.env.TERM) {
            return process.env.TERM;
        } else {
            return "xterm";
        }
    }

    private _formatCommand(args: Array<string>, command: string): Array<string> {
        return args.map(arg => {
            if (arg.indexOf('{command}') == -1) {
                return arg;
            } else {
                return arg.format({command});
            }
        })
    }
}
