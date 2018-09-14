const fs = require("fs");
const path = require("path");

function getManifest(os) {
    return JSON.parse(fs.readFileSync(path.join(os, "manifest.json")).toString());
}

function getContainerName(buildType) {
    switch (buildType) {
        case "stable":
            return "stable";
        case "insider":
            return "insider";
        default:
            return "test";
    }
}

module.exports = {
    getManifest,
    getContainerName,
};
