/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

import color from "cli-color";
import * as editorconfig from "editorconfig";
import * as fs from "fs";
import inquirer from "inquirer";
import * as os from "os";
import * as path from "path";
import * as shell from "shelljs";

export const batchExplorerHome = path.resolve("../../");
export const configFile = path.resolve(
    os.homedir(),
    ".config/batch/butil.json"
);

const portalReactPath = "src/src/BatchExtension/Client/ReactViews";
const defaultJsonIndentSize = 2;

export interface Configuration {
    paths: {
        batchExplorer?: string;
        batchPortalExtension?: string;
    };
}

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
        fs.writeFile(filename, JSON.stringify(json, null, indent), resolve)
    );
}

export function validateDirectory(path: string) {
    if (shell.test("-d", path)) {
        return true;
    }
    return "Not a valid directory";
}

export function resolvePath(...paths: string[]) {
    if (paths.length > 0 && paths[0]) {
        paths[0] = paths[0].replace(/^~/, os.homedir());
    }
    return path.resolve(...paths);
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
    let configPath = `${batchExplorerHome}/.editorconfig`;
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

// integrations have one place to look for things like coverage reports
export function gatherBuildResults(basePath: string) {
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

/**
 * Configure CLI properties
 */
export async function configure() {
    const config = readJsonOrDefault(configFile);
    config.paths ||= {};
    const answers = await inquirer.prompt([
        {
            name: "batchPortalExtension",
            message: "Path to Batch Portal Extension",
            default: config.paths.batchPortalExtension,
            validate: validateDirectory,
        },
        {
            name: "batchExplorer",
            message: "Path to Batch Explorer",
            default: config.paths.batchExplorer || batchExplorerHome,
            validate: validateDirectory,
        },
    ]);

    for (const [key, value] of Object.entries(answers)) {
        config.paths[key] = resolvePath(value as string);
    }
    await saveJson(configFile, config);
    info(`Configuration saved to ${configFile}`);
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
        config.paths.batchExplorer || batchExplorerHome,
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
