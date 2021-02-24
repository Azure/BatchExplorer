// eslint-disable no-console
import * as crypto from "crypto";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as util from "util";
import { artifactsNames, getLocalPath, getRemotePath, version } from "./package-utils";

const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

async function createSha512(file) {
    const content = await readFile(file);
    const shasum = crypto.createHash("sha512");
    shasum.update(content);
    return shasum.digest("base64");
}

function saveContent(content: any, suffix?: string) {
    const str = yaml.safeDump(content, { lineWidth: 8000 });

    let name = "latest";
    if (suffix) {
        name = `${name}-${suffix}`;
    }
    const filename = getLocalPath(`${name}.yml`);
    fs.writeFileSync(filename, str);
    console.log(`Created ${filename} index file for version ${version}`);
    return filename;
}

async function getFileRef(file: string) {
    const localPath = getLocalPath(file);
    const remotePath = getRemotePath(file);
    const sha512 = await createSha512(localPath);
    const stats = await stat(localPath);
    return { url: remotePath, sha512, size: stats.size };
}

export async function createWindowsIndexFile() {
    const installer = await getFileRef(artifactsNames.windowsInstaller);

    const latest = {
        version,
        files: [
            installer,
        ],
        sha512: installer.sha512,
        path: installer.url,
        releaseDate: new Date().toISOString(),
    };

    return saveContent(latest);
}

export async function createLinuxIndexFile() {
    const appImage = await getFileRef(artifactsNames.linuxAppImage);

    const latest = {
        version: version,
        files: [
            appImage,
        ],
        sha512: appImage.sha512,
        path: appImage.url,
        releaseDate: new Date().toISOString(),
    };
    return saveContent(latest, "linux");
}

export async function createDarwinIndexFile() {
    const zip = await getFileRef(artifactsNames.darwinZip);
    const dmg = await getFileRef(artifactsNames.darwinDmg);

    const latest = {
        version: version,
        files: [
            zip,
            dmg,
        ],
        sha512: zip.sha512,
        path: zip.url,
        releaseDate: new Date().toISOString(),
    };

    return saveContent(latest, "mac");
}
