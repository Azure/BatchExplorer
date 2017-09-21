const githubAccessToken = "dbf50a23223f537679de24de2ccff0e6fc9e14cd";
const labsRepo = "Azure/BatchLabs";

let downloadLinkEls;
let downloadLinks;
let versionEl;

function getGithub(uri) {
    const url = `https://api.github.com${uri}`;
    return fetch(url, {
        headers: {
            Authorization: `token ${githubAccessToken}`,
        }
    }).then((res) => res.json());
}

function listRelease() {
    return getGithub(`/repos/${labsRepo}/releases`);
}

function getLatestRelease() {
    return listRelease().then((releases) => {
        return releases[0];
    });
}


function getAsset(assets, endsWith) {
    for (const asset of assets) {
        if (asset.name.endsWith(endsWith)) {
            return asset.browser_download_url;
        }
    }
    return null;
}

function updateDownloadLinks() {
    for (const key of Object.keys(downloadLinkEls)) {
        downloadLinkEls[key].href = downloadLinks[key];
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    versionEl = document.getElementById("batch-labs-version")
    //do 
    downloadLinkEls = {
        windowsInstaller: document.getElementById("download-windows-installer"),
        windowsZip: document.getElementById("download-windows-zip"),
        osxDmg: document.getElementById("download-osx-dmg"),
        osxZip: document.getElementById("download-osx-zip"),
        linuxDeb: document.getElementById("download-linux-deb"),
        linuxRpm: document.getElementById("download-linux-rpm"),
        linuxAppimage: document.getElementById("download-linux-appimage"),
    }

    getLatestRelease().then((release) => {
        const suffix = release.prerelease ? " (Beta)" : "";
        versionEl.textContent = release.name + suffix;

        downloadLinks = {
            windowsInstaller: getAsset(release.assets, ".exe"),
            windowsZip: getAsset(release.assets, "win.zip"),
            osxDmg: getAsset(release.assets, ".dmg"),
            osxZip: getAsset(release.assets, "mac.zip"),
            linuxDeb: getAsset(release.assets, ".deb"),
            linuxRpm: getAsset(release.assets, ".rpm"),
            linuxAppimage: getAsset(release.assets, ".AppImage"),
        }

        updateDownloadLinks()
    })

});