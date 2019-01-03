import * as commander from "commander";
import { app } from "electron";

export interface BatchExplorerArgs {
    updated?: boolean;
    userDataDir?: string;
    args: string[];
}

export function parseArguments(argv: string[]): BatchExplorerArgs {
    return commander
        .version(app.getVersion())
        .option("--updated", "If the application was just updated")
        .option("--user-data-dir <path>", "Change the user data directory. Used for tests")
        .parse(["", ...argv]);
}
