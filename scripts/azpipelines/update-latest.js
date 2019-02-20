// tslint:disable:no-console
// @ts-check
const azureStorage = require("azure-storage");
const path = require("path");
const fs = require("fs");
const { getManifest, getContainerName } = require("./utils");
const { promisify } = require("util");

const copyFile = promisify(fs.copyFile);

const stagingDir = path.join(process.env.AGENT_TEMPDIRECTORY, "batchexplorer-github");
console.log("Env", process.env);
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];

console.log("Artifact staging directory is", stagingDir);
console.log(`##vso[task.setvariable variable=BE_GITHUB_ARTIFACTS_DIR]${stagingDir}`)

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);
const blobService = azureStorage.createBlobService(storageAccountName, storageAccountKey);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProperties(container, blob) {
    return new Promise((resolve, reject) => {
        blobService.getBlobProperties(container, blob, (error, result) => {
            if (error) { return reject(error); }
            resolve(result);
        });
    });
}

async function waitCopy(container, blob) {
    while (true) {
        const properties = await getProperties(container, blob);
        const copyStatus = properties.copy && properties.copy.status;
        switch (copyStatus) {
            case "success":
                return true;
            case "aborted":
                throw new Error("Copy was aborted");
            case "failed":
                throw new Error("Copy has failed");
            case "pending":
                console.log(`Copy "${blob}"is pending`);
        }
        sleep(5000);
    }
}

async function startCopyBlob(source, container, blob) {
    return new Promise((resolve, reject) => {
        blobService.startCopyBlob(source, container, blob, (error, result) => {
            if (error) { return reject(error); }

            resolve(result);
        });
    });
}

async function copyBlob(source, container, blob) {
    await startCopyBlob(source, container, blob);
    return waitCopy(container, blob);
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
    console.log(`Copy ${manifest.files.length} files for os: ${os}`);
    for (const file of manifest.files) {
        copyFile(path.join(os, file.path), path.join(stagingDir, file.path))
    }
}

async function copyAllFilesToArtifactStaging() {
    console.log(`Starting copying artifacts for github release`);
    await copyFilesToArtifactStaging("windows");
    await copyFilesToArtifactStaging("linux");
    await copyFilesToArtifactStaging("darwin");
}

async function updateLatest(os) {
    const manifest = getManifest(os);
    console.log(`##vso[task.setvariable variable=BE_RELEASE_VERSION]${manifest.version}`)
    console.log(`Updating latest for os: ${os}`);
    const container = getContainerName(manifest.buildType);
    const latestFile = getLatestFile(os);
    const orgiginalBlob = `${manifest.version}/${latestFile}`;
    const sourceUrl = blobService.getUrl(container, orgiginalBlob);
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
