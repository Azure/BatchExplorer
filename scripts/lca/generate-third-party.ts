import * as commander from "commander";
import * as fs from "fs";
import fetch from "node-fetch";
import * as path from "path";
import { Constants } from "../../src/client/client-constants";

export interface ThirdPartyNoticeOptions {
    check?: boolean;
}

const defaultThirdPartyNoticeOptions: ThirdPartyNoticeOptions = {
    check: false,
};

const thirdPartyNoticeFile = path.join(Constants.root, "ThirdPartyNotices.txt");

const output: string[] = [];
const gitUrlRegex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/[-\w@.]+\/)?(.*?)(\.git)?(\/?|\#[-\d\w._]+?)$/;
const repoNameRegex = /https?:\/\/github\.com\/(.*)/;
const innerSeparator = "-".repeat(60);
const outerSeparator = "=".repeat(60);

const defaultLicenseRoot = path.join(Constants.root, "scripts/lca/default-licenses");

// eslint-disable no-console
const defaultLicenses = {
    "mit": fs.readFileSync(path.join(defaultLicenseRoot, "mit.txt")).toString(),
    "bsd-2-clause": fs.readFileSync(path.join(defaultLicenseRoot, "bsd-2-clause.txt")).toString(),
    "(ofl-1.1 and mit)": fs.readFileSync(path.join(defaultLicenseRoot, "ofl-1.1-and-mit.txt")).toString(),
    "apache-2.0": fs.readFileSync(path.join(defaultLicenseRoot, "apache-2.0.txt")).toString(),
    "electron": fs.readFileSync(path.join(defaultLicenseRoot, "electron.txt")).toString(),
};

const additionalDependencies = [
    {
        name: "websockets",
        version: "3.3",
        url: "https://github.com/aaugustin/websockets",
        repoUrl: "https://github.com/aaugustin/websockets",
        licenseType: "BSD-3-Clause",
    },
    {
        name: "azure-batch-cli-extensions",
        version: "0.2.0",
        url: "https://github.com/Azure/azure-batch-cli-extensions",
        repoUrl: "https://github.com/Azure/azure-batch-cli-extensions",
        licenseType: "MIT",
    },
    {
        name: "node.js",
        version: "7.4.0",
        url: "https://nodejs.org/en/",
        repoUrl: "https://github.com/nodejs/node",
        licenseType: "MIT",
    },
    {
        name: "python",
        version: "3.6.1",
        url: "https://www.python.org/",
        repoUrl: "https://github.com/python/cpython",
        licenseType: "PSF",
    },
    {
        name: "Electron",
        version: "1.8.1",
        url: "https://electronjs.org/",
        repoUrl: "https://github.com/electron/electron",
        licenseType: "electron",
    },
];

function listDependencies(): string[] {

    const packageJsonPath = path.join(Constants.root, "package.json");

    const batchExplorerPackage = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    const dependencies: string[] = Object.keys(batchExplorerPackage.dependencies);

    return dependencies.sort((a, b) => {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    });
}

function loadDependency(name: string) {
    const contents = fs.readFileSync(`node_modules/${name}/package.json`).toString();
    const dependency = JSON.parse(contents);
    const repoUrl = getRepoUrl(dependency);
    const url = dependency.homepage || repoUrl;
    return {
        name: dependency.name,
        version: dependency.version,
        url: url,
        repoUrl: repoUrl,
        licenseType: dependency.license,
    };
}

function getRepoUrl(dependency) {
    const repo = dependency.repository;
    if (!repo) { return null; }
    if (typeof repo === "string") {
        return `https://github.com/${repo}`;
    }
    const match = gitUrlRegex.exec(repo.url);
    if (!match) { return null; }
    return `https://github.com/${match[2]}`;
}

function getRepoName(repoUrl: string | null): string | null {
    if (!repoUrl) { return null; }
    const match = repoNameRegex.exec(repoUrl);
    if (!match) {
        console.error("Couldn't get repo name for ", repoUrl);
        return null;
    }
    const value = match[1];
    return value.split("/").slice(0, 2).join("/");
}

function loadLicense(repoUrl: string | null, anonymous = false): Promise<any> {
    const repoName = getRepoName(repoUrl);
    const licenseUrl = `https://api.github.com/repos/${repoName}/license`;
    const headers = anonymous ? {} : { Authorization: `token ${process.env.GH_TOKEN}`}

    return fetch(licenseUrl, {headers}).then((res) => {
        /** Will look up default license if cannot find a license */
        if (!anonymous && res.status === 403) {
            console.warn(`Access denied, retrying request anonymously. Url: ${licenseUrl}`);
            return loadLicense(repoUrl, anonymous = true);
        } else if (res.status >= 300 && res.status != 404) {
            throw new Error(`Response status ${res.status} ${res.statusText} with url: ${licenseUrl}`);
        }
        return res.json();
    }).catch((error) => {
        console.error(`Error loading license for ${repoName}`, error);
        process.exit(1)
    });
}

function decode64(content: string) {
    return Buffer.from(content, "base64").toString();
}

function getHeader() {
    return fs.readFileSync(path.join(Constants.root, "scripts/lca/header.txt")).toString();
}

function getLicenseContent(dependency, license) {
    if (!license.content) {
        const licenseType = dependency.licenseType && dependency.licenseType.toLowerCase();
        if (licenseType in defaultLicenses) {
            return defaultLicenses[licenseType];
        } else {
            console.warn(`Repo ${dependency.name} doesn't have a license file`
                + ` for ${licenseType} and no default provided`);
            return null;
        }
    } else {
        return decode64(license.content);
    }
}

function checkNoticeUpToDate(notices: string) {
    const existingNotices = fs.readFileSync(thirdPartyNoticeFile).toString();
    if (existingNotices === notices) {
        console.log("ThirdPartyNotice.txt is up to date.");
        process.exit(0);
    } else {
        console.error("ThirdPartyNotice.txt is not up to date."
            + " Please run 'npm run ts scripts/lca/generate-third-party'");
        process.exit(1);
    }
}

function run(options: ThirdPartyNoticeOptions = {}) {
    options = { ...defaultThirdPartyNoticeOptions, ...options };
    output.push(getHeader());
    output.push("");

    const depenencyNames = listDependencies();
    const dependencies = depenencyNames.map((dep) => {
        return loadDependency(dep);
    }).concat(additionalDependencies);
    console.log("Loading dependencies...");

    const toc = dependencies.map((dependency, index) => {
        return `${index}. ${dependency.name}(${dependency.url}) - ${dependency.licenseType}`;
    });
    output.push(toc.join("\n"));
    output.push("");

    const licensePromises = dependencies.map((dependency, index) => {
        return loadLicense(dependency.repoUrl);
    });
    console.log("Loading licenses...");

    Promise.all(licensePromises).then((licenses) => {
        for (const [i, license] of licenses.entries()) {
            const dependency = dependencies[i];
            output.push(outerSeparator);
            output.push(`    Start license for ${dependency.name}`);
            output.push(innerSeparator);

            const licenseContent = getLicenseContent(dependency, license);
            if (!licenseContent) { continue; }

            output.push(licenseContent);
            output.push(innerSeparator);
            output.push(`    End license for ${dependency.name}`);
            output.push(outerSeparator);
            output.push("");
        }
        const notices = output.join("\n");

        if (options.check) {
            checkNoticeUpToDate(notices);
        } else {
            fs.writeFileSync(thirdPartyNoticeFile, notices);
            console.log(`Generated third party notice file at ${thirdPartyNoticeFile}`);
        }
    });
}

const options = commander
    .option("-c, --check", "Check the current third party notice file is valid.")
    .parse(process.argv);

run(options as any);
