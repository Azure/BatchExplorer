import * as fs from "fs";
import * as path from "path";

export const root = path.resolve(path.join(__dirname, "../.."));
export const releasePath = path.join(root, "release");
const packageDef = JSON.parse(fs.readFileSync(path.join(root, "package.json")).toString());

const buildVersion = process.env.BUILD_NUMBER;
export const buildType = process.env.BUILD_TYPE || "dev";

export enum BuildType {
    // When building locally or from a pull request(Not signed)
    Dev = "dev",
    // Official build release
    Stable = "stable",
    // Build off master
    Insider = "insider",
}

export const version = computeVersion();
export const artifactsNames = {
    windowsInstaller: `BatchExplorer Setup ${version}.exe`,
    linuxAppImage: `batch-explorer-${version}-x86_64.AppImage`,
    darwinZip: `BatchExplorer-${version}-mac.zip`,
    darwinDmg: `BatchExplorer-${version}.dmg`,
};

export function getLocalPath(file: string) {
    return path.join(releasePath, file);
}

export function getRemotePath(file: string) {
    return `${version}/${file}`;
}

function computeVersion() {
    let version = `${packageDef.version}-${buildType}`;
    if (buildVersion) {
        version += `.${buildVersion}`;
    }
    return version;
}
