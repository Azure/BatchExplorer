import * as commander from "commander";
import { app } from "electron";

export interface BatchExplorerArgs {
    disableAutoupdate?: boolean;
    updated?: boolean;
    userDataDir?: string;
    ignoreCertificateErrors?: boolean;
    args: string[];
}

// add user config options (in Settings) to also let the status of the autoupdate to persist - whether that be on or off
// change naming to "set autoupdate on/off" or "autoupdate set to true/false" -> as Xing/Matt
export function parseArguments(argv: string[]): BatchExplorerArgs {
    return commander
        .version(app.getVersion())
        .option("--disable-autoupdate", "Disables autoupdate for one instance of opening the application")
        .option("--updated", "If the application was just updated")
        .option("--user-data-dir <path>", "Change the user data directory. Used for tests")
        .option("--ignore-certificate-errors", "Ignore https certificate errors")
        .parse(["", ...argv]);
}
