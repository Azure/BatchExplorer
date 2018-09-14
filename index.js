const githubAccessToken = "dbf50a23223f537679de24de2ccff0e6fc9e14cd";
const labsRepo = "Azure/BatchExplorer";

let downloadLinkEls;
let downloadLinks = {};
let versionEl;

const feedUrls = {
    stable: "https://batchexplorer.azureedge.net/stable",
    insider: "https://batchexplorer.blob.core.windows.net/test",
}

const feedUrl = feedUrls[buildType];

function getLatest(source) {
    const rand = Math.floor(Math.random() * 100000);
    const url = `${feedUrl}/${source}?noCache=${rand}`;
    return fetch(url, { cache: "no-cache" }).then((res) => {
        return res.text();
    }).then(content => {
        return jsyaml.load(content);
    });
}

function getWindowsLatest() {
    return getLatest("latest.yml").then(x => {
        return x.version;
    });
}

function getMacLatest() {
    return getLatest("latest-mac.yml").then(x => {
        return x.version;
    });
}

function getLinuxLatest() {
    return getLatest("latest-linux.yml").then(x => {
        return x.version;
    });
}

function updateDownloadLinks() {
    for (const key of Object.keys(downloadLinkEls)) {
        downloadLinkEls[key].href = downloadLinks[key];
    }

    // TODO: figure out what OS the user is running and pick the right default
    document.getElementById("primary-download-btn").href = downloadLinks["windowsInstaller"]

    document.getElementById("download-windows-installer-btn").href = downloadLinks["windowsInstaller"]
    document.getElementById("download-osx-app-btn").href = downloadLinks["osxDmg"]
    document.getElementById("download-linux-deb-btn").href = downloadLinks["linuxDeb"]
}

document.addEventListener("DOMContentLoaded", (event) => {
    versionEl = document.getElementById("batch-labs-version")
    //do 
    downloadLinkEls = {
        windowsInstaller: document.getElementById("download-windows-installer"),
        windowsZip: document.getElementById("download-windows-zip"),
        osxZip: document.getElementById("download-osx-zip"),
        osxDmg: document.getElementById("download-osx-dmg"),
        linuxDeb: document.getElementById("download-linux-deb"),
        linuxRpm: document.getElementById("download-linux-rpm"),
        linuxAppimage: document.getElementById("download-linux-appimage"),
    }

    getWindowsLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["windowsInstaller"] = `${feedUrl}/${version}/BatchExplorer Setup ${version}.exe`
        downloadLinks["windowsZip"] = `${feedUrl}/${version}/BatchExplorer-${version}-win.zip`
        updateDownloadLinks()
    });

    getLinuxLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["linuxDeb"] = `${feedUrl}/${version}/batch-explorer_${version}_amd64.deb`;
        downloadLinks["linuxRpm"] = `${feedUrl}/${version}/batch-explorer-${version}.x86_64.rpm`;
        downloadLinks["linuxAppimage"] = `${feedUrl}/${version}/batch-explorer-${version}-x86_64.AppImage`;
        updateDownloadLinks()
    });

    getMacLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["osxDmg"] = `${feedUrl}/${version}/BatchExplorer-${version}.dmg`;
        downloadLinks["osxZip"] = `${feedUrl}/${version}/BatchExplorer-${version}-mac.zip`;
        updateDownloadLinks()
    });

});