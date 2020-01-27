import * as commander from "commander";
import { app } from "electron";

export interface BatchExplorerArgs {
    doNotAutoupdate?: boolean;
    updated?: boolean;
    userDataDir?: string;
    ignoreCertificateErrors?: boolean;
    args: string[];
}

export function parseArguments(argv: string[]): BatchExplorerArgs {
    return commander
        .version(app.getVersion())
        .option("--do-not-autoupdate", "Will not autoupdate the application")
        .option("--updated", "If the application was just updated")
        .option("--user-data-dir <path>", "Change the user data directory. Used for tests")
        .option("--ignore-certificate-errors", "Ignore https certificate errors")
        .parse(["", ...argv]);
}
