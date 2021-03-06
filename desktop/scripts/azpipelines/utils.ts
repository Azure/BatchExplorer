import * as fs from "fs";
import * as path from "path";

interface Manifest {
    version?: string;
    buildType?: string;
    files?: [
        {
            path?: string;
            remotePath?: string;
        }
    ];
}

export function getManifest(os: string): Manifest {
    return JSON.parse(fs.readFileSync(path.join(os, "manifest.json")).toString());
}

export function getContainerName(buildType: string): string {
    switch (buildType) {
        case "stable":
            return "stable";
        case "insider":
            return "insider";
        default:
            return "test";
    }
}
