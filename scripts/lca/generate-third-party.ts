import * as fs from "fs";
import * as path from "path";
import { Constants } from "../../src/client/client-constants";

const thirdPartyNoticeFile = path.join(Constants.root, "ThirdPartyNotices.txt");
const outputStream = fs.createWriteStream(thirdPartyNoticeFile, { flags: "w" });
const gitUrlRegex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;

// tslint:disable:no-console
const licensesFilenames = [
];

function listDependencies(): string[] {

    const packageJsonPath = path.join(Constants.root, "package.json");

    const batchLabsPackage = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    const dependencies: string[] = Object.keys(batchLabsPackage.dependencies);

    return dependencies.sort((a, b) => {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    });

}
function loadDependency(name: string) {
    const contents = fs.readFileSync(`node_modules/${name}/package.json`).toString();
    const dependency = JSON.parse(contents);

    const url = dependency.homepage || getRepoUrl(dependency);
    return {
        name: dependency.name,
        version: dependency.version,
        authors: dependency.author,
        url: url,
        licenseType: dependency.license,
    };
}

function getRepoUrl(dependency) {
    const repo = dependency.repository;
    if (typeof repo === "string") {
        return `https://github.com/${repo}`;
    }
    const match = gitUrlRegex.exec(repo.url);
    if (!match) { return null; }
    return `https://${match[2]}`;
}
function loadLicense(name: string) {
    return null;
}

function getHeader() {
    return fs.readFileSync(path.join(Constants.root, "scripts/lca/header.txt")).toString();
}

function run() {
    outputStream.write(getHeader());
    outputStream.write("\n");

    const depenencyNames = listDependencies();
    const dependencies = depenencyNames.map((dep) => {
        return loadDependency(dep);
    });

    let toc = dependencies.map((dependency, index) => {
        return `${index}. ${dependency.name}(${dependency.url})`;
    });
    outputStream.write(toc.join("\n"));
    outputStream.write("\n");
    console.log(toc.join("\n"));
}

run();
