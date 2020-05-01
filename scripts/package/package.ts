import * as electronBuilder from "electron-builder";
import { createDarwinManifest, createLinuxManifest, createWindowsManifest } from "./manifest";
import { version } from "./package-utils";
import {
    createDarwinIndexFile, createLinuxIndexFile, createWindowsIndexFile,
} from "./update-info";

/**
 * Base build function which will update common attributes to all platforms
 */
async function baseBuild(options?: electronBuilder.CliOptions) {
    return electronBuilder.build({
        config: {
            extraMetadata: {
                version,
            },
        },
        ...options,
    });
}

/**
 * Just create the windows executable.
 * This is so exe can be signed before creating installer
 */
async function createWindowsExecutable() {
    return baseBuild({
        dir: true,
        win: ["exe"],
    });
}

/**
 * Just create the windows executable.
 * This is so exe can be signed before creating installer
 */
async function createWindowsInstaller() {
    return baseBuild({
        win: ["nsis", "zip"],
        prepackaged: "./release/win-unpacked",
        projectDir: ".",
    });
}

/**
 * Just create the mac os app file.
 * This is so app can be signed before creating the dmg
 */
async function createDarwinApp() {
    return baseBuild({
        targets: electronBuilder.Platform.MAC.createTarget(["dir"]),
    });
}

/**
 * Just create the mac os app file.
 * This is so app can be signed before creating the dmg
 */
async function createDarwinDmg() {
    return baseBuild({
        targets: electronBuilder.Platform.MAC.createTarget(["zip", "dmg"]),
        prepackaged: "./release/mac/BatchExplorer.app",
        projectDir: ".",
    });
}

async function buildDefault() {
    return baseBuild();
}

async function build() {
    const action: string = process.argv[2] || "default";

    switch (action) {
        case "win-exe":
            return createWindowsExecutable();
        case "win-installer":
            return createWindowsInstaller();
        case "win-manifest":
            await createWindowsIndexFile();
            return createWindowsManifest();
        case "darwin-app":
            return createDarwinApp();
        case "darwin-dmg":
            return createDarwinDmg();
        case "darwin-manifest":
            await createDarwinIndexFile();
            return createDarwinManifest();
        case "linux-manifest":
            await createLinuxIndexFile();
            return createLinuxManifest();
        default:
            return buildDefault();
    }
}

build().catch((err) => {
    // tslint:disable-next-line:no-console
    console.error(err);
    process.exit(1);
});
