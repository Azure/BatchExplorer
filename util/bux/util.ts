/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

import { execSync } from "child_process";
import color from "cli-color";
import * as editorconfig from "editorconfig";
import * as fs from "fs";
import inquirer from "inquirer";
import * as os from "os";
import * as path from "path";
import * as shell from "shelljs";
import { createEnglishTranslations } from "./translation-functions";

export const defaultBatchExplorerHome = path.resolve(__dirname, "../../");
export const configFile = path.resolve(os.homedir(), ".config/batch/bux.json");

const portalReactPath = "src/src/BatchExtension/Client/ReactViews";
const defaultJsonIndentSize = 2;
const printJsonIndentSize = 4;

export interface Configuration {
    paths: {
        batchExplorer?: string;
        batchPortalExtension?: string;
    };
}

type ConfigPath = keyof Configuration["paths"];

export const info = (...args: string[]) => console.log(color.blue(...args));
export const warn = (...args: string[]) => console.warn(color.yellow(...args));
export const error = (...args: string[]) => console.error(color.red(...args));

export function readJsonOrDefault(filename: string, defaultJson = {}) {
    if (fs.existsSync(filename)) {
        // eslint-disable-next-line security/detect-non-literal-require
        return require(filename);
    }
    return defaultJson;
}

export async function saveJson(filename: string, json: unknown) {
    const indent =
        ((await getEditorConfig("indent_size", filename)) as number) ??
        defaultJsonIndentSize;
    const confPath = path.dirname(filename);
    if (!fs.existsSync(confPath)) {
        mkdirp(confPath);
    }
    return new Promise((resolve) =>
        fs.writeFile(filename, JSON.stringify(json, null, indent), resolve)
    );
}

export function validateDirectory(path: string) {
    if (shell.test("-d", path)) {
        return true;
    }
    return "Not a valid directory";
}

export function resolvePath(aPath: string) {
    aPath = aPath?.replace(/^~/, os.homedir());
    return path.resolve(aPath);
}

export async function loadConfiguration(): Promise<Configuration> {
    return readJsonOrDefault(configFile);
}

/**
 * Gets option from the project's editor config.
 * @param {string} option The config option to return
 * @param {string} filePattern The file pattern to get the option for (defaults to global)
 * @returns a promise that resolves to the option
 */
export async function getEditorConfig(
    option: keyof editorconfig.KnownProps,
    filePattern?: string
) {
    let configPath = `${defaultBatchExplorerHome}/.editorconfig`;
    if (filePattern) {
        configPath += "/" + filePattern;
    }
    const config: editorconfig.KnownProps = await editorconfig.parse(
        configPath
    );
    return config[option];
}

export function copyFiles(sourcePath: string, destPath: string) {
    if (!sourcePath) {
        error("Failed to copy: No source path specified");
        return;
    }
    if (!destPath) {
        error("Failed to copy: No dest path specified");
        return;
    }

    shell.cp(sourcePath, destPath);
}

export async function buildTranslations(
    sourcePath: string,
    destPathJSON: string,
    destPathRESJSON: string,
    packageName?: string
) {
    if (!sourcePath) {
        error("Failed to build translations: No source path specified");
        return;
    }
    if (!destPathJSON) {
        error(
            "Failed to build translations: No dest path for JSON output files specified"
        );
        return;
    } else {
        //Create a new destination directory specified by this parameter if it doesn't already exist

        fs.mkdir(destPathJSON, { recursive: true }, (err) => {
            if (err) {
                if (err.code !== "EEXIST") throw err;
            }
        });
    }
    if (!destPathRESJSON) {
        error(
            "Failed to build translations: No dest path for RESJSON output files specified"
        );
        return;
    } else {
        //Create a new destination directory specified by this parameter if it doesn't already exist

        fs.mkdir(destPathRESJSON, { recursive: true }, (err) => {
            if (err) {
                if (err.code !== "EEXIST") throw err;
            }
        });
    }

    await createEnglishTranslations(
        sourcePath,
        destPathJSON,
        destPathRESJSON,
        packageName
    );
}

export function mkdirp(targetPath: string) {
    if (!targetPath) {
        error("Failed to make directory: No path specified");
        return;
    }
    targetPath = path.resolve(targetPath);

    fs.mkdirSync(targetPath, { recursive: true });
}

export function moveFiles(sourcePath: string, destPath: string) {
    if (!sourcePath) {
        error("Failed to move: No source path specified");
        return;
    }
    if (!destPath) {
        error("Failed to move: No dest path specified");
        return;
    }

    shell.mv(sourcePath, destPath);
}

export function rmrf(targetPath: string) {
    if (!targetPath) {
        error("Failed to delete: No path specified");
        return;
    }
    fs.rmSync(path.resolve(targetPath), {
        recursive: true,
        force: true,
    });
}

export function chmodx(paths: string[] | unknown) {
    if (!paths || !Array.isArray(paths)) {
        return;
    }
    for (const path of paths) {
        shell.chmod("+x", path);
    }
}

type GitInfo = {
    branch: string;
    stagedChanges: string[];
    unstagedChanges: string[];
};

function getGitInfo(path: string): GitInfo {
    const info: GitInfo = {
        branch: "unknown",
        stagedChanges: [],
        unstagedChanges: [],
    };
    try {
        info.branch = execSync("git branch --show-current", {
            cwd: path,
            encoding: "utf-8",
        }).trim();

        execSync("git status --porcelain=v1", {
            cwd: path,
            encoding: "utf-8",
        })
            .split(/\r?\n/) // Handle CRLF & LF line endings
            .forEach((line) => {
                if (line.startsWith(" ")) {
                    info.unstagedChanges.push(line.trim());
                } else if (line.trim() !== "") {
                    info.stagedChanges.push(line.trim());
                }
            });
    } catch (e) {
        if (e instanceof Error) {
            error(`Error retreiving Git info: ${e.message}`);
        }
        throw e;
    }

    return info;
}

function printInfo(name: string, repoPath?: string): void {
    if (!repoPath) {
        throw new Error(`No ${name} path configured`);
    }

    if (fs.existsSync(repoPath)) {
        const gitInfo = getGitInfo(repoPath);
        info(`${name} (${gitInfo.branch})`);
        info(`  - Path: ${repoPath}`);
        if (gitInfo.stagedChanges.length > 0) {
            info("  - Staged changes:");
            info(`      ${gitInfo.stagedChanges.join("\n      ")}`);
        }
        if (gitInfo.unstagedChanges.length > 0) {
            info("  - Unstaged changes:");
            info(`      ${gitInfo.unstagedChanges.join("\n      ")}`);
        }
    } else {
        throw new Error(`${name} not found at ${repoPath}`);
    }
}

async function printLinkStatus(): Promise<void> {
    const linkChecks: boolean[] = [];
    await runLinkageTask((opts: LinkOptions) => {
        let isLinked = false;

        const nodeModulePath = path.join(
            opts.targetPath,
            "node_modules",
            opts.packageName
        );

        if (fs.existsSync(nodeModulePath)) {
            const stats = fs.lstatSync(nodeModulePath);
            if (stats.isSymbolicLink()) {
                isLinked = true;
            }
        }

        linkChecks.push(isLinked);
    });

    const allPackagesLinked = linkChecks.reduce((prev, curr) => prev && curr);
    let linkStatus;
    if (allPackagesLinked) {
        linkStatus = color.green("active");
    } else {
        linkStatus = color.blue("inactive");
    }
    console.log(`${color.blue("Link is")} ${linkStatus}`);
}

export async function printStatus() {
    const config = await loadConfiguration();

    try {
        printInfo("Batch Explorer", config.paths.batchExplorer);
        info("");
        printInfo("Batch portal extension", config.paths.batchPortalExtension);
        info("");
        await printLinkStatus();
    } catch (e) {
        error("Config errors found. Run `bux configure` to re-configure.");
        throw e;
    }
}

// integrations have one place to look for things like coverage reports
export async function gatherBuildResults(basePath: string) {
    if (!basePath) {
        basePath =
            (await loadConfiguration()).paths?.batchExplorer ??
            defaultBatchExplorerHome;
    }
    const baseBuildDir = path.join(basePath, "build");

    const doCopy = (src: string, dst: string) => {
        info(`Copying build/test results from ${src}/* to ${dst}`);
        if (!fs.existsSync(src)) {
            warn(`${src} does not exist - skipping`);
            return;
        }
        mkdirp(dst);
        shell.cp("-r", src + "/*", dst);
    };

    // packages
    doCopy(
        path.join(basePath, "packages", "common", "build"),
        path.join(baseBuildDir, "common")
    );
    doCopy(
        path.join(basePath, "packages", "react", "build"),
        path.join(baseBuildDir, "react")
    );

    // web
    doCopy(path.join(basePath, "web", "build"), path.join(baseBuildDir, "web"));

    // desktop
    doCopy(
        path.join(basePath, "desktop", "coverage"),
        path.join(baseBuildDir, "desktop", "coverage")
    );
}

export async function linkLocalProjects() {
    runLinkageTask((opts: LinkOptions) => {
        info(`Linking ${opts.versionedPackageName}`);

        const nodeModulePath = path.join(
            opts.targetPath,
            "node_modules",
            opts.packageName
        );

        if (!fs.existsSync(nodeModulePath)) {
            throw new Error(
                `Failed to link ${opts.packageName}: ${nodeModulePath} doesn't exist`
            );
        }

        const stats = fs.lstatSync(nodeModulePath);
        if (!stats.isDirectory()) {
            throw new Error(
                `Failed to link ${opts.packageName}: ${nodeModulePath} is not a directory`
            );
        }
        if (stats.isSymbolicLink()) {
            throw new Error(
                `Failed to link ${opts.packageName}: ${nodeModulePath} is already a symlink`
            );
        }

        shell.rm("-rf", nodeModulePath);
        shell.ln("-s", opts.packagePath, nodeModulePath);
    });
}

export async function unlinkLocalProjects() {
    runLinkageTask(
        (opts: LinkOptions) => {
            info(`Unlinking ${opts.versionedPackageName}`);

            const nodeModulePath = path.join(
                opts.targetPath,
                "node_modules",
                opts.packageName
            );

            if (!fs.existsSync(nodeModulePath)) {
                throw new Error(
                    `Failed to unlink ${opts.packageName}: ${nodeModulePath} doesn't exist`
                );
            }

            const stats = fs.lstatSync(nodeModulePath);
            if (!stats.isSymbolicLink()) {
                throw new Error(
                    `Failed to unlink ${opts.packageName}: ${nodeModulePath} is not a symlink`
                );
            }

            shell.rm(nodeModulePath);
        },
        (targetPath: string) => {
            info("Running `npm install` to restore packages...");
            shell.cd(targetPath);
            shell.exec(`npm install -s`);
        }
    );
}

export type ConfigureCommandOptions = {
    "paths.batchExplorer"?: string;
    "paths.batchPortalExtension"?: string;
    print: boolean;
};

/**
 * Configure CLI properties
 */
export async function configure(options: ConfigureCommandOptions) {
    const config = await loadConfiguration();
    config.paths ||= {};

    // If valid configuration options are passed in the command-line, set or
    // update the config object and skip prompting.
    if (isConfigurationObject(options)) {
        for (const [key, configPath] of Object.entries(options.paths)) {
            if (isConfigPathKey(key)) {
                config.paths[key] = resolvePath(configPath);
            }
        }
    } else {
        const answers = await inquirer.prompt([
            {
                name: "batchPortalExtension",
                message: "Path to Batch Portal Extension",
                default: config.paths.batchPortalExtension,
                validate: validateDirectory,
                type: "string",
            },
            {
                name: "batchExplorer",
                message: "Path to Batch Explorer",
                default: config.paths.batchExplorer || defaultBatchExplorerHome,
                validate: validateDirectory,
                type: "string",
            },
        ]);
        for (const [key, value] of Object.entries(answers)) {
            config.paths[key as ConfigPath] = resolvePath(value as string);
        }
    }

    await saveJson(configFile, config);
    info(`Configuration saved to ${configFile}`);
    if (options.print) {
        printJson(config);
    }
}

const versionRegExp = /^[\^~]?([0-9.]+)/;

/**
 * Loosely compare two different package versions, ignoring anything but
 * major/minor/patch version numbers.
 *
 * Examples:
 *     "^1.2.3-foo.9" and "1.2.3" match
 *     "^1.2.3" and "1.2.5" do not match"
 */
export function versionsLooselyMatch(v1: string, v2: string) {
    const normalize = (version: string) => {
        const matches = version.match(versionRegExp);
        if (matches?.length !== 2) {
            throw new Error(`Invalid version: ${version}`);
        }
        return matches[1];
    };
    return normalize(v1) === normalize(v2);
}

interface LinkOptions {
    versionedPackageName: string;
    packageName: string;
    packagePath: string;
    targetPath: string;
}

/**
 * Links or unlinks local NPM projects as dependencies
 */
async function runLinkageTask(
    perPackageCallback: (opts: LinkOptions) => void,
    cleanupCallback?: (targetPath: string) => void
) {
    const config = await loadConfiguration();
    if (!config.paths || !config.paths.batchPortalExtension) {
        error(
            `Configuration does not contain portal paths. ` +
                `Run the 'configure' command to fix.`
        );
        return;
    }
    const targetPath = path.join(
        config.paths.batchPortalExtension,
        portalReactPath
    );
    const targetPackageJson = path.join(targetPath, "package.json");
    if (!fs.existsSync(targetPackageJson)) {
        error(`No package.json in target directory ${targetPath}`);
        return;
    }

    const targetConf = readJsonOrDefault(targetPackageJson);

    const packageRoot = path.join(
        config.paths.batchExplorer || defaultBatchExplorerHome,
        "packages"
    );

    // Iterate over each source package to link/unlink
    shell.ls(`${packageRoot}/*/package.json`).forEach((packageJson) => {
        const packagePath = packageJson.replace("/package.json", "");
        const json = readJsonOrDefault(packageJson);
        const packageName = json.name;
        const sourceVersion = json.version;

        let targetVersion = targetConf.dependencies?.[packageName];
        if (!targetVersion) {
            targetVersion = targetConf.devDependencies?.[packageName];
        }
        if (targetVersion) {
            if (!versionsLooselyMatch(targetVersion, sourceVersion)) {
                warn(
                    `Target version ${targetVersion} different ` +
                        `than source version ${sourceVersion}`
                );
            }
            perPackageCallback({
                packageName,
                versionedPackageName: `${packageName}@${sourceVersion}`,
                packagePath,
                targetPath,
            });
        }
    });

    if (cleanupCallback) {
        cleanupCallback(targetPath);
    }
}

function isConfigurationObject(object: unknown): object is Configuration {
    if (!object || typeof object !== "object") {
        return false;
    }
    return "paths" in object;
}

function isConfigPathKey(key: string): key is ConfigPath {
    return ["batchExplorer", "batchPortalExtension"].includes(key);
}

function printJson(json: object) {
    info(JSON.stringify(json, null, printJsonIndentSize));
}
