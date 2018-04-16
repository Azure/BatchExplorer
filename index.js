const githubAccessToken = "dbf50a23223f537679de24de2ccff0e6fc9e14cd";
const labsRepo = "Azure/BatchLabs";

let downloadLinkEls;
let downloadLinks = {};
let versionEl;

const feedUrl = "https://batchlabsdist.blob.core.windows.net/releases";

function getLatest(source) {
    const url = `${feedUrl}/${source}`;
    return fetch(url).then((res) => {
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
    document.getElementById("download-osx-app-btn").href = downloadLinks["osxApp"]
    document.getElementById("download-linux-deb-btn").href = downloadLinks["linuxDeb"]
}

document.addEventListener("DOMContentLoaded", (event) => {
    versionEl = document.getElementById("batch-labs-version")
    //do 
    downloadLinkEls = {
        windowsInstaller: document.getElementById("download-windows-installer"),
        windowsZip: document.getElementById("download-windows-zip"),
        osxApp: document.getElementById("download-osx-app"),
        osxZip: document.getElementById("download-osx-zip"),
        linuxDeb: document.getElementById("download-linux-deb"),
        linuxRpm: document.getElementById("download-linux-rpm"),
        linuxAppimage: document.getElementById("download-linux-appimage"),
    }

    getWindowsLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["windowsInstaller"] = `${feedUrl}/${version}/BatchLabs Setup.exe`
        downloadLinks["windowsZip"] = `${feedUrl}/${version}/BatchLabs-win.zip`
        updateDownloadLinks()
    });

    getLinuxLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["linuxDeb"] = `${feedUrl}/${version}/BatchLabs.deb`;
        downloadLinks["linuxRpm"] = `${feedUrl}/${version}/BatchLabs.rpm`;
        downloadLinks["linuxAppimage"] = `${feedUrl}/${version}/BatchLabs.AppImage`;
        updateDownloadLinks()
    });

    getMacLatest().then((version) => {
        versionEl.textContent = version;
        downloadLinks["osxApp"] = `${feedUrl}/${version}/BatchLabs.app`;
        downloadLinks["osxZip"] = `${feedUrl}/${version}/BatchLabs-osx.zip`;
        updateDownloadLinks()
    });

});