import * as fs from "fs";
import { BuildType, artifactsNames, buildType, getLocalPath, getRemotePath, version } from "./package-utils";

interface ManifestFile {
    path: string;
    remotePath: string;
}

/**
 * This create a manifest file that can be used in the release process
 */
interface Manifest {
    version: string;
    buildType: BuildType;
    files: ManifestFile[];
}

function saveManifest(content: Manifest) {
    const str = JSON.stringify(content, null, 2);

    const filename = getLocalPath(`manifest.json`);
    fs.writeFileSync(filename, str);
    // tslint:disable-next-line:no-console
    console.log(`Created ${filename} manifest file for version ${version}`);
    return filename;
}

function getFileRef(file: string): ManifestFile {
    return {
        path: file,
        remotePath: getRemotePath(file),
    };
}

export async function createWindowsManifest() {
    const latest = {
        version,
        buildType,
        files: [
            getFileRef(artifactsNames.windowsInstaller),
            getFileRef(artifactsNames.windowsZip),
            getFileRef("latest.yml"),
        ],
    };

    return saveManifest(latest);
}

export async function createLinuxManifest() {
    return saveManifest({
        version,
        buildType,
        files: [
            getFileRef(artifactsNames.linuxAppImage),
            getFileRef(artifactsNames.linuxDeb),
            getFileRef(artifactsNames.linuxRpm),
            getFileRef("latest-linux.yml"),
        ],
    });
}

export async function createDarwinManifest() {
    return saveManifest({
        version,
        buildType,
        files: [
            getFileRef(artifactsNames.darwinDmg),
            getFileRef(artifactsNames.darwinZip),
            getFileRef("latest-mac.yml"),
        ],
    });
}
