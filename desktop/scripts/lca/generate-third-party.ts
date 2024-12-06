// eslint-disable no-console

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { Constants } from "../../src/client/client-constants";

interface ThirdPartyNoticeOptions {
    check?: boolean;
}

interface Dependency {
    name: string;
    version: string;
    url: string;
    repoUrl?: string | null;
    licenseType: string;
}

interface License {
    content: string;
}

const defaultThirdPartyNoticeOptions: ThirdPartyNoticeOptions = {
    check: false,
};

const thirdPartyNoticeFile = path.join(Constants.root, "ThirdPartyNotices.txt");

const output: string[] = [];
const gitUrlRegex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/[-\w@.]+\/)?(.*?)(\.git)?(\/?|#[-\d\w._]+?)$/;
const repoNameRegex = /https?:\/\/github\.com\/(.*)/;
const innerSeparator = "-".repeat(60);
const outerSeparator = "=".repeat(60);

const defaultLicenseRoot = path.join(__dirname, "default-licenses");

const defaultLicenses = {
    "mit": "mit.txt",
    "bsd-2-clause": "bsd-2-clause.txt",
    "(ofl-1.1 and mit)": "ofl-1.1-and-mit.txt",
    "apache-2.0": "apache-2.0.txt",
    "electron": "electron.txt",
};

const additionalDependencies: Dependency[] = [
    {
        name: "node.js",
        version: "18.16.1",
        url: "https://nodejs.org/en/",
        repoUrl: "https://github.com/nodejs/node",
        licenseType: "MIT",
    },
    {
        name: "Electron",
        version: "26.1.0",
        url: "https://electronjs.org/",
        repoUrl: "https://github.com/electron/electron",
        licenseType: "electron",
    },
    {
        name: "Chromium",
        version: "116.0",
        url: "https://www.chromium.org/",
        repoUrl: "https://github.com/chromium/chromium",
        licenseType: "BSD-3-Clause"
    }
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

function loadDependency(name: string): Dependency {
    const contents = fs.readFileSync(`node_modules/${name}/package.json`).toString();
    const dependency = JSON.parse(contents);
    const repoUrl = getRepoUrl(dependency);
    const url = dependency.homepage || repoUrl;
    return {
        name: dependency.name,
        version: dependency.version,
        url,
        repoUrl,
        licenseType: dependency.license,
    };
}

function getRepoUrl(dependency) {
    const repo = dependency.repository;
    if (!repo) { return null; }
    if (typeof repo === "string") {
        if (repo.startsWith(`https://github.com/`)) {
            return repo;
        }
        return `https://github.com/${repo.replace(/^github:/, "")}`;
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

async function loadLicense(dependency: Dependency, anonymous = false):
    Promise<License> {
    const { repoUrl = null } = dependency;
    const repoName = getRepoName(repoUrl);
    const licenseUrl = `https://api.github.com/repos/${repoName}/license`;
    const headers: HeadersInit = anonymous ? {} :
        { Authorization: `token ${process.env.GH_TOKEN}` };

    return fetch(licenseUrl, { headers }).then(async (res) => {
        /** Will look up default license if cannot find a license */
        if (!anonymous && res.status === 403) {
            console.warn(`Access denied, retrying request anonymously. Url: ${licenseUrl}`);
            return loadLicense(dependency, anonymous = true);
        } else if (res.status >= 300 && res.status != 404) {
            throw new Error(`Response status ${res.status} ${res.statusText} with url: ${licenseUrl}`);
        } else if (res.status === 404) {
            console.warn(`No license found for ${repoName}. Using default license ${dependency.licenseType} instead.`);
        }
        return await res.json();
    }).catch((error) => {
        console.error(`Error loading license for ${repoName}`, error);
        process.exit(1);
    });
}

function decode64(content: string) {
    return Buffer.from(content, "base64").toString();
}

function getHeader() {
    return fs.readFileSync(path.join(__dirname, "header.txt")).toString();
}

function getLicenseContent(dependency, license): string | null {
    if (!license.content) {
        const licenseType = dependency?.licenseType.toLowerCase();
        if (Object.keys(defaultLicenses).includes(licenseType)) {
            const licenseFilePath =
                path.join(defaultLicenseRoot, defaultLicenses[licenseType]);
            const licenseContent = fs.readFileSync(licenseFilePath).toString();
            return licenseContent;
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

    const dependencyNames = listDependencies();
    const dependencies = dependencyNames
        .map(dep => loadDependency(dep))
        .concat(additionalDependencies);
    console.log("Loading dependencies...");

    const toc = dependencies.map((dependency, index) => {
        return `${index + 1}. ${dependency.name} (${dependency.url}) - ${dependency.licenseType}`;
    });
    output.push(toc.join("\n"));
    output.push("");

    const licensePromises = dependencies.map((dependency) => {
        return loadLicense(dependency);
    });
    console.log("Loading licenses...");

    Promise.all(licensePromises).then((licenses) => {
        for (const [i, license] of licenses.entries()) {
            const dependency = dependencies[i];
            output.push(outerSeparator);
            output.push(`    Start license for ${dependency.name}`);
            output.push(innerSeparator);

            const licenseContent = getLicenseContent(dependency, license);

            output.push(licenseContent || "[NO LICENSE]");
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

const options = program
    .option("-c, --check",
        "Check the current third party notice file is valid.")
    .parse(process.argv);

run({ check: options.getOptionValue("check") });
