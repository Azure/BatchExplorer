const githubAccessToken = "dbf50a23223f537679de24de2ccff0e6fc9e14cd";
const labsRepo = "Azure/BatchLabs";

let downloadLinkEls;
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


document.addEventListener("DOMContentLoaded", (event) => {
    versionEl = document.getElementById("batch-labs-version")
    //do 
    downloadLinkEls = {
        windows: {
            installer: document.getElementById("download-windows-installer"),
            zip: document.getElementById("download-windows-zip"),
        },
        osx: {
            dmg: document.getElementById("download-osx-dmg"),
            zip: document.getElementById("download-osx-zip"),
        },
        linux: {
            deb: document.getElementById("download-linux-deb"),
            rpm: document.getElementById("download-linux-rpm"),
            appimage: document.getElementById("download-linux-appimage"),
        },
    }

    getLatestRelease().then((release) => {
        console.log("releases", release);
        const suffix = release.prerelease ? " (Beta)" : "";
        versionEl.textContent = release.name + suffix;
    })
});