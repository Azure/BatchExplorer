import { ExecException, exec } from "child_process";

/**
 * Result of running execCommand
 */
export interface ExecCommandResult {
    stdout: string;
    stderr: string;
}

/**
 * Execute a command line and wait for the output.
 * @param command Command line to run
 *
 * @returns Promise that resolove when the command line complete.
 */
export function execCommand(command: string): Promise<ExecCommandResult> {
    return new Promise((resolve, reject) => {
        exec(command, (error: ExecException, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}
