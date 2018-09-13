// tslint:disable:no-console
// @ts-check
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const azureStorage = require("azure-storage");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountKey = process.argv[2];
const buildType = process.env.BUILD_TYPE;

let containerName = "test";

if (buildType === "stable") {
    containerName = "stable";
} else if (buildType === "insider") {
    containerName = "insider";
}

const version = getVersion();

console.log("Uploading for build type", buildType);

if (!storageAccountKey) {
    console.error("No storage account key passed");
    process.exit(-1);
}

console.log("Uploading to storage account:", storageAccountName);
const blobService = azureStorage.createBlobService(storageAccountName, storageAccountKey);

async function uploadToBlob(filename, blobName, override = false) {
    console.log(`Uploading ${filename} ====> Container=${containerName}, Blobname=${blobName}`);

    const options = {};
    if (!override) {
        options.accessConditions = azureStorage.AccessCondition.generateIfNotExistsCondition();
    }

    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(containerName, blobName, filename, options,
            (error, result, response) => {
                if (error) {
                    reject(error);
                }

                console.log("Uploaded", result, response);
                resolve(result);
            });
    });
}

const artifactsNames = {
    windowsInstaller: `BatchExplorer Setup ${version}.exe`,
    linuxAppImage: `batch-explorer-${version}-x86_64.AppImage`,
    linuxRpm: `batch-explorer-${version}.x86_64.rpm`,
    linuxDeb: `batch-explorer_${version}_amd64.deb`,
    darwinZip: `BatchExplorer-${version}-mac.zip`,
    darwinDmg: `BatchExplorer-${version}.dmg`,
};

function getRemotePath(file) {
    return `${version}/${file}`;
}

async function upload(folder, file) {
    await uploadToBlob(path.join(folder, file), getRemotePath(file));
}
async function uploadWindows() {
    await upload("./windows", artifactsNames.windowsInstaller);
    await upload("./windows", artifactsNames.windowsZip);
}

async function uploadLinux() {
    await upload("./linux", artifactsNames.linuxAppImage);
    await upload("./linux", artifactsNames.linuxDeb);
    await upload("./linux", artifactsNames.linuxRpm);
}

async function uploadDawin() {
    await upload("./darwin", artifactsNames.darwinDmg);
    await upload("./darwin", artifactsNames.darwinZip);
}

function getVersion() {
    const data = yaml.load(fs.readFileSync(`./windows/${buildType}.yml`).toString());
    return data.version;
}

async function run() {
    console.log(`Starting uploading artifacts`);
    await uploadWindows();
    await uploadLinux();
    await uploadDawin();
}

run().then(() => {
    console.log("Done uploading...");
}).catch(e => {
    console.error(`Error in node`, e);
    process.exit(3);
});
