// tslint:disable:no-console
// @ts-check
const fs = require("fs");
const path = require("path");
const azureStorage = require("azure-storage");
const { getManifest, getContainerName } = require("./utils");
const crypto = require("crypto");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];
const attemptNumber = Number(process.env.Release_AttemptNumber);

console.log(`This is the ${attemptNumber} try to release`);

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);
const blobService = azureStorage.createBlobService(storageAccountName, storageAccountKey);

function computeFileMd5(filename) {
    const data = fs.readFileSync(filename);
    return crypto.createHash("md5").update(data).digest("hex");
}

async function getBlob(container, blobName) {
    return new Promise((resolve, reject) => {
        blobService.getBlobProperties(container, blobName, (error, result, response) => {
            if (error) {
                return reject(error);
            }

            console.log("Uploaded", result, response);
            resolve(result);
        });
    });
}

async function createBlobFromLocalFile(container, filename, blobName, override = false) {
    const options = {};
    if (!override) {
        options.accessConditions = azureStorage.AccessCondition.generateIfNotExistsCondition();
    }

    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(container, blobName, filename, options,
            (error, result, response) => {

                if (error) {
                    reject(error);
                    return;
                }

                console.log("Uploaded", result, response);
                resolve(result);
            });
    });
}

async function uploadToBlob(container, filename, blobName, override = false) {
    console.log(`Uploading ${filename} ====> Container=${container}, Blobname=${blobName}`);
    try {
        return await createBlobFromLocalFile(container, filename, blobName, override);
    } catch (error) {
        console.log("Error code is", error.code);
        if (error.code === "BlobAlreadyExists") {
            const blob = await getBlob(container, blobName);
            const md5 = computeFileMd5(filename);
            const blobMd5 = blob.contentSettings && blob.contentSettings.contentMD5;
            if (md5 === blobMd5) {
                console.log(`Already uploaded ${filename} skipping`);
            } else {
                throw new Error("Error blob already exists but doesn't match the local file.");
            }
        } else {
            throw error;
        }
    }
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
