import * as cp from "child_process";

const supportedTerminals = {
    powershell: {
        proc: "cmd.exe",
        args: "/c start powershell -NoExit -Command {command}",
    },
    cmd: {
        proc: "cmd.exe",
        args: "/c start {terminalLoc} /k {command}",
    },
};

export class TerminalService {
    public _serviceBrand: any;

    constructor() {}

    public runInTerminal(command: string, terminal?: string, envVars?: StringMap<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let myTerminal;
            let terminalLoc;

            // check if the user provided a the name of a supported terminal application
            if (terminal && (terminal in supportedTerminals)) {
                if (terminal === "cmd") {
                    terminalLoc = this._getTerminalLocationWindows();
                }
                myTerminal = supportedTerminals[terminal];
            } else {
                // otherwise, use the OS default
                myTerminal = this._getDefaultTerminalByOS();
            }

            // make a deep copy of myTerminal so we don't overwrite the defaults
            myTerminal = JSON.parse(JSON.stringify(myTerminal));

            // wrap the command in double quotes to ensure it is invoked as one command
            command = `"${command}"`;

            // replace the command template with the actual command to be run in the terminal window
            myTerminal.args = myTerminal.args.format({terminalLoc, command});

            // merge environment variables into a copy of the process.env
            const env = envVars ? {...process.env, ...envVars} : process.env;

            // delete environment variables that have a null value
            Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);

            const options: cp.SpawnOptions = {
                env: env,
                windowsVerbatimArguments: true,
                detached: true,
            };

            const cmd = cp.spawn(myTerminal.proc, [myTerminal.args], options);
            cmd.on("error", reject);

            resolve(null);
        });
    }

    /**
     * Determine the user's OS and return the correct default terminal
     */
    private _getDefaultTerminalByOS(): any {
        return supportedTerminals.powershell;
        // TODO: add if-else logic to work with macOS and Linux systems
    }

    /**
     * Returns the default terminal for this user's windows system
     */
    private _getTerminalLocationWindows(): string {
        const isWoW64 = !!process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
        return `${process.env.windir ? process.env.windir :
            "C:\\Windows"}\\${isWoW64 ? "Sysnative" : "System32"}\\cmd.exe`;
    }
}
