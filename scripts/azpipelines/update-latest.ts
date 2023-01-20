// eslint-disable no-console
import makeDir from "make-dir";
import * as path from "path";
import * as fs from "fs";
import { getManifest, getContainerName, BlobStorageClient } from "./utils";
import { promisify } from "util";

const copyFile = promisify(fs.copyFile);

if (!process.env.AGENT_TEMPDIRECTORY) {
    throw new Error(
        "Required AGENT_TEMPDIRECTORY environment variable is empty"
    );
}
const stagingDir = path.join(process.env.AGENT_TEMPDIRECTORY,
    "batchexplorer-github");
console.log("Env", process.env);
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];

console.log("Artifact staging directory is", stagingDir);
console.log(`##vso[task.setvariable variable=BE_GITHUB_ARTIFACTS_DIR]${stagingDir}`)

if (!storageAccountName) {
    console.error(`No storage account name found in AZURE_STORAGE_ACCOUNT`);
    process.exit(-1)
}

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);

const storageClient = new BlobStorageClient(storageAccountName,
    storageAccountKey);

async function copyBlob(source, container, blob) {
    const poller = await storageClient.beginCopyBlob(source, container, blob);
    try {
        return await poller.pollUntilDone();
    } catch (error) {
        switch (error.name) {
            case "PollerCancelledError":
                throw new Error(`Copy was cancelled: ${error.message}`);
            case "PollerStoppedError":
                throw new Error(`Copy was stopped: ${error.message}`);
            default:
                throw new Error(`Copy failed: ${error.message}`);
        }
    }
}

function getLatestFile(os) {
    switch (os) {
        case "darwin":
            return "latest-mac.yml";
        case "linux":
            return "latest-linux.yml";
        default:
            return "latest.yml";
    }
}

async function copyFilesToArtifactStaging(os) {
    const manifest = getManifest(os);
    if (manifest.files) {
        console.log(`Copy ${manifest.files.length} files for os: ${os}`);
        for (const file of manifest.files) {
            if (file.path) {
                await copyFile(
                    path.join(os, file.path),
                    path.join(stagingDir, file.path)
                );
            }
        }
    }
}

async function copyAllFilesToArtifactStaging() {
    console.log(`Starting copying artifacts for github release`);
    await makeDir(stagingDir);
    await copyFilesToArtifactStaging("windows");
    await copyFilesToArtifactStaging("linux");
    await copyFilesToArtifactStaging("darwin");
}

async function updateLatest(os) {
    const manifest = getManifest(os);
    console.log(`##vso[task.setvariable variable=BE_RELEASE_VERSION]${manifest.version}`)
    console.log(`Updating latest for os: ${os}`);
    if (!manifest.buildType) {
        throw new Error(
            "Manifest does not contain required value for buildType"
        );
    }
    const container = getContainerName(manifest.buildType);
    const latestFile = getLatestFile(os);
    const originalBlob = `${manifest.version}/${latestFile}`;
    const sourceUrl = storageClient.getUrl(container, originalBlob);
    console.log("Copying", sourceUrl, container, latestFile);
    return copyBlob(sourceUrl, container, latestFile);
}

async function run() {
    await copyAllFilesToArtifactStaging();
    await updateLatest("windows");
    await updateLatest("linux");
    await updateLatest("darwin");
}

run().then(() => {
    console.log("Done uploading...");
}).catch(e => {
    console.error(`Error in`, e);
    process.exit(1);
});
