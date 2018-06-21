import * as cp from "child_process";
import { TerminalService } from "./terminal.service";

// const supportedTerminals = {
//     "powershell": "powershell -NoExit -Command {command}",
//      etc...
// }

export class WinTerminalService implements TerminalService {
    public _serviceBrand: any;

    private static readonly CMD = "cmd.exe";

    constructor() {}

    public runInTerminal(args: string[], dir?: string, envVars?: StringMap<string>): Promise<void> {
        const terminal = this.getDefaultTerminalWindows();

        return new Promise<void>((c, e) => {

            const command = `"${args.join(" ")}"`; // use '|' to only pause on non-zero exit code
            const cmdArgs = [
                "/c", "start", terminal, "/k", command,
            ];

            console.log(cmdArgs);

            // merge environment variables into a copy of the process.env
            const env = envVars ? Object.assign({}, process.env, envVars) : process.env;

            // delete environment variables that have a null value
            Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);

            const options: any = {
                cwd: dir,
                env: env,
                windowsVerbatimArguments: true,
            };

            const cmd = cp.spawn(WinTerminalService.CMD, cmdArgs, options);
            cmd.on("error", e);

            c(null);
        });
    }

    private getDefaultTerminalWindows(): string {
        const isWoW64 = !!process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
        return `${process.env.windir ? process.env.windir :
            "C:\\Windows"}\\${isWoW64 ? "Sysnative" : "System32"}\\cmd.exe`;
    }
}
