// tslint:disable:no-console
// @ts-check
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProperties(container, blob) {
    return new Promise((resolve, reject) => {
        blobService.getBlobProperties(container, blob, (result, error) => {
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
        blobService.startCopyBlob(source, container, blob, (result, error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(result);
        });
    });
}

async function copyBlob(source, container, blob) {
    await startCopyBlob(source, container, blob);
    return waitCopy(container, blob);
}

async function getLatestFile(os) {
    switch (os) {
        case "darwin":
            return "latest-mac.yml";
        case "linux":
            return "latest-linux.yml";
        default:
            return "latest.yml";
    }
}

async function updateLatest(os) {
    const manifest = getManifest(os);
    console.log(`Updating latest for os: ${os}`);
    const container = getContainerName(manifest.buildType);
    const latestFile = getLatestFile(os);
    const orgiginalBlob = `${manifest.version}/${latestFile}`;
    const sourceUrl = blobService.getUrl(container, orgiginalBlob);
    console.log("Copying", sourceUrl, container, latestFile);
    return copyBlob(sourceUrl, container, latestFile);
}

async function run() {
    await updateLatest("windows");
    await updateLatest("linux");
    await updateLatest("darwin");
}

run().then(() => {
    console.log("Done uploading...");
}).catch(e => {
    console.error(`Error in node`, e);
    process.exit(1);
});
