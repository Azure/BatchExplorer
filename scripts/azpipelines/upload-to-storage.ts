// eslint-disable no-console
import * as fs from "fs";
import * as path from "path";
import { getManifest, getContainerName, BlobStorageClient } from "./utils";
import * as crypto from "crypto";

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];
const attemptNumber = Number(process.env.Release_AttemptNumber);

console.log(`This is the ${attemptNumber} try to release`);

if (!storageAccountName) {
    console.error(`No storage account name found in AZURE_STORAGE_ACCOUNT`);
    process.exit(-1);
}

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);

function computeFileMd5(filename) {
    const data = fs.readFileSync(filename);
    return crypto.createHash("md5").update(data).digest("base64");
}

const storageClient = new BlobStorageClient(storageAccountName,
    storageAccountKey);

async function createBlobFromLocalFile(container, filename, blobName, override = false) {
    const response = await storageClient.createBlob(container, blobName,
        filename, override);

    console.log("Uploaded", response);
    return response;
}

async function uploadToBlob(container, filename, blobName, override = false) {
    console.log(`Uploading ${filename} ====> Container=${container}, Blobname=${blobName}`);
    try {
        return await createBlobFromLocalFile(container, filename, blobName, override);
    } catch (error) {
        if (error.details.errorCode === "BlobAlreadyExists") {
            const blob = await storageClient.getBlob(container, blobName);
            const md5 = computeFileMd5(filename);
            const blobMd5 = blob.blobContentMD5?.toString();
            if (md5 === blobMd5) {
                console.log(`Already uploaded ${filename} skipping(Md5 hash matched)`);
            } else {
                throw new Error(`Error blob already exists but doesn't match the local file. ${md5} != ${blobMd5}`);
            }
        } else {
            throw error;
        }
    }
}

async function uploadFiles(os) {
    const manifest = getManifest(os);
    if (manifest.files) {
        console.log(`Uploading ${manifest.files?.length} files for os: ${os}`);
        if (!manifest.buildType) {
            throw new Error(
                "Manifest does not contain required value for buildType"
            );
        }
        const container = getContainerName(manifest.buildType);
        for (const file of manifest.files) {
            if (file.path) {
                await uploadToBlob(container, path.join(os, file.path),
                    file.remotePath);
            }
        }
    } else {
        console.error(`Cannot get manifest for ${os}`);
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
