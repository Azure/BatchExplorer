/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

import color from "cli-color";
import * as editorconfig from "editorconfig";
import * as fs from "fs";
import inquirer from "inquirer";
import * as os from "os";
import * as path from "path";
import * as shell from "shelljs";
import * as semver from "semver";

export const defaultBatchExplorerHome = path.resolve(__dirname, "../../");
export const configFile = path.resolve(
    os.homedir(),
    ".config/batch/butil.json"
);

export const defaultPrereleaseTag = "dev";

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

interface PackageJson {
    name: string;
    version: string;
    dependencies: {
        [name: string]: string;
    };
    devDependencies: {
        [name: string]: string;
    };
}

type PackageConfigMapType = { [path: string]: PackageJson };

export const VersionReleaseTypes = {
    major: "major",
    minor: "minor",
    patch: "patch",
    premajor: "premajor",
    preminor: "preminor",
    prepatch: "prepatch",
    prerelease: "prerelease",
} as const;

export type ReleaseType = semver.ReleaseType;

// Packages published to an artifact feed
export const publicPackages = [
    "packages/common",
    "packages/service",
    "packages/react",
    "packages/playground",
];

// Packages that share the fixed version
export const fixedVersionPackages = [
    ...publicPackages,
    "web",
    "util/build-util",
    "util/common-config",
];

// All packages
export const allPackages = [...fixedVersionPackages, "desktop"];

export const info = (...args: string[]) => console.log(color.blue(...args));
export const warn = (...args: string[]) => console.warn(color.yellow(...args));
export const error = (...args: string[]) => console.error(color.red(...args));

export function readJsonOrDefault(filename: string, defaultJson = {}) {
    if (fs.existsSync(filename)) {
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
        fs.writeFile(
            filename,
            JSON.stringify(json, null, indent) + "\n",
            resolve
        )
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

// integrations have one place to look for things like coverage reports
export async function gatherBuildResults(basePath: string) {
    if (!basePath) {
        basePath = await getBasePath();
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
        shell.cd(opts.packagePath);
        shell.exec(`npm -s link`);
        shell.cd(opts.targetPath);
        shell.exec(`npm link ${opts.packageName}`);
    });
}

export async function unlinkLocalProjects() {
    runLinkageTask((opts: LinkOptions) => {
        info(`Unlinking ${opts.versionedPackageName}`);
        shell.cd(opts.targetPath);
        shell.rm(`node_modules/${opts.packageName}`);
        shell.exec(`npm install ${opts.versionedPackageName}`);
    });
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

export async function bumpVersion(releaseType: ReleaseType, tag: string) {
    const basePath = await getBasePath();
    const packageConfigs = await loadPackageConfigs();
    const currentVersion = getCurrentVersion(packageConfigs);
    const targetVersion = semver.inc(currentVersion, releaseType, tag);
    if (!targetVersion) {
        error(
            `Unable to determine next ${releaseType} version of ` +
                currentVersion
        );
        process.exit(1);
    }

    const operations = [];
    const ppn = color.bold;
    const pcv = color.yellow;
    const ptv = color.green;

    // Update the package version
    const fixedVersionPackageNames: string[] = [];
    for (const packagePath of fixedVersionPackages) {
        const config = packageConfigs[packagePath];
        config.version = targetVersion;
        fixedVersionPackageNames.push(config.name);
        operations.push(
            `${ppn(config.name)}: ${pcv(currentVersion)} ` +
                `=> ${ptv(targetVersion)}`
        );
    }

    console.log("Summary of changes:\n\n", operations.join("\n"));
    const { confirmSave } = await inquirer.prompt([
        { type: "confirm", name: "confirmSave", message: "Proceed?" },
    ]);

    if (confirmSave) {
        const saveOperations = [];
        for (const packagePath of allPackages) {
            const filename = path.join(basePath, packagePath, "package.json");
            saveOperations.push(
                saveJson(filename, packageConfigs[packagePath])
            );
        }
        await saveOperations;
        info("Done.");
    }
}

/**
 * [WIP]
 *
 * Update dependencies and devDependencies.
 *
 * @param targetVersion The target version to update to
 */
export async function updateDependencies(targetVersion: string) {
    const operations = [];
    const ppn = color.bold;
    const pcv = color.yellow;
    const ptv = color.green;

    const packageConfigs = await loadPackageConfigs();

    const fixedVersionPackageNames: string[] = [];
    for (const packagePath of fixedVersionPackages) {
        fixedVersionPackageNames.push(packageConfigs[packagePath].name);
    }

    const runUpdate = (
        config: PackageJson,
        type: "dependencies" | "devDependencies"
    ) => {
        if (config[type]) {
            let printedHeader = false;
            for (const dependency of fixedVersionPackageNames) {
                if (dependency in config[type]) {
                    const currentVersion = config[type][dependency];
                    config[type][dependency] = `^${targetVersion}`;
                    if (!printedHeader) {
                        operations.push(`${ppn(config.name)}.${type}:`);
                        printedHeader = true;
                    }
                    operations.push(
                        `  ${dependency}@${pcv(currentVersion)} => ` +
                            `${ptv("^" + targetVersion)}`
                    );
                }
            }
        }
    };

    // Update dependency and devDependency versions
    for (const packagePath of allPackages) {
        const config = packageConfigs[packagePath];
        runUpdate(config, "dependencies");
        runUpdate(config, "devDependencies");
    }
}

interface PublishCommandOptions {
    tag?: string;
    confirm?: boolean;
    npmconfig?: string;
}

export async function publishPackages(options: PublishCommandOptions) {
    const { tag, confirm = true, npmconfig } = options;
    const basePath = await getBasePath();
    const packageConfigs = await loadPackageConfigs(publicPackages);
    const npm = npmconfig ? `npm --userconfig ${npmconfig}` : `npm`;
    const confirmLines = [""];
    for (const packagePath in packageConfigs) {
        const config = packageConfigs[packagePath];

        info(`Building ${config.name}`);
        shell.exec(`${npm} run -s build -- --scope ${config.name}`, {
            silent: true,
        });
        if (confirm) {
            const { version, numFiles, registry } = publishPreview(
                npm,
                path.join(basePath, packagePath)
            );
            confirmLines.push(
                color.blue(config.name),
                `Version: ${color.yellow(version)}`,
                `Files: ${color.yellow(numFiles)}`,
                `Registry ${color.yellow(registry)}`
            );
        }
    }

    let publish = false;
    if (confirm) {
        console.log(confirmLines.join("\n"), "\n");
        const { confirmPublish } = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmPublish",
                message: "Publish?",
                default: false,
            },
        ]);

        publish = confirmPublish;
    } else {
        publish = true;
    }

    if (publish) {
        info("");
        for (const packagePath in packageConfigs) {
            info(`Publishing ${packageConfigs[packagePath].name} with ${tag}`);
            const absPath = path.join(basePath, packagePath);
            shell.exec(
                `${npm} publish ${absPath} ${tag ? "--tag " + tag : ""}`
            );
        }
    }
}

function publishPreview(
    npm: string,
    packagePath: string
): {
    version: string;
    numFiles: string;
    registry: string;
} {
    const { stdout } = shell.exec(
        `${npm} publish --dry-run ${packagePath} 2>&1`,
        {
            silent: true,
        }
    );
    const extract = (regex: RegExp) => {
        const m = stdout.match(regex);
        return m ? m[1] : "N/A";
    };
    return {
        version: extract(/npm notice version:\s+(\S+)/),
        numFiles: extract(/npm notice total files:\s+(\d+)/),
        registry: extract(/npm notice Publishing to\s+(\S+)/),
    };
}

interface LinkOptions {
    versionedPackageName?: string;
    packageName?: string;
    packagePath?: string;
    targetPath?: string;
}

/**
 * Links or unlinks local NPM projects as dependencies
 */
async function runLinkageTask(callback: (opts: LinkOptions) => void) {
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
            if (targetVersion !== sourceVersion) {
                warn(
                    `Target version ${targetVersion} different ` +
                        `than source version ${sourceVersion}`
                );
            }
            callback({
                packageName,
                versionedPackageName: `${packageName}@${sourceVersion}`,
                packagePath,
                targetPath,
            });
        } else {
            info(`Package ${packageName} not in dependencies - skipping`);
        }
    });
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

async function loadPackageConfigs(
    packages = allPackages
): Promise<PackageConfigMapType> {
    const basePath = await getBasePath();

    const configs: PackageConfigMapType = {};

    for (const packagePath of packages) {
        const json = readJsonOrDefault(
            path.join(basePath, packagePath, "package.json")
        );
        configs[packagePath] = json;
    }
    return configs;
}

const getBasePath = async () =>
    (await loadConfiguration()).paths?.batchExplorer ??
    defaultBatchExplorerHome;

function getCurrentVersion(configs: PackageConfigMapType): string {
    let version = "";
    for (const packagePath of fixedVersionPackages) {
        const packageVersion = configs[packagePath].version;
        if (version === "") {
            version = packageVersion;
        } else if (packageVersion !== version) {
            error("Versions in public packages do not match");
            for (const p of fixedVersionPackages) {
                const json = configs[p];
                info(json.name + ": " + json.version);
            }
            process.exit(1);
        }
    }
    return version;
}
