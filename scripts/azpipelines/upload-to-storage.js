// tslint:disable:no-console
// @ts-check
const fs = require("fs");
const path = require("path");
const azureStorage = require("azure-storage");
const { getManifest, getContainerName } = require("./utils");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);
const blobService = azureStorage.createBlobService(storageAccountName, storageAccountKey);

async function uploadToBlob(container, filename, blobName, override = false) {
    console.log(`Uploading ${filename} ====> Container=${container}, Blobname=${blobName}`);

    const options = {};
    if (!override) {
        options.accessConditions = azureStorage.AccessCondition.generateIfNotExistsCondition();
    }

    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(container, blobName, filename, options,
            (error, result, response) => {
                if (error) {
                    reject(error);
                }

                console.log("Uploaded", result, response);
                resolve(result);
            });
    });
}

async function uploadFiles(os) {
    const manifest = getManifest(os);
    console.log(`Uploading ${manifest.files.length} files for os: ${os}`);
    const container = getContainerName(manifest.buildType);
    for (const file of manifest.files) {
        await uploadToBlob(container, path.join(os, file.path), file.remotePath);
    }
}

async function run() {
    console.log(`Starting uploading artifacts`);
    await uploadFiles("windows");
    await uploadFiles("linux");
    await uploadFiles("darwin");
}

run().then(() => {
    console.log("Done uploading...");
}).catch(e => {
    console.error(`Error in node`, e);
    process.exit(1);
});
