import * as electronBuilder from "electron-builder";
import * as fs from "fs";
import * as path from "path";

const root = path.resolve(path.join(__dirname, "../.."));
const packageDef = JSON.parse(fs.readFileSync(path.join(root, "package.json")).toString());

enum BuildType {
    // When building locally or from a pull request(Not signed)
    Dev = "dev",
    // Official build release
    Stable = "stable",
    // Build off master
    Insider = "insider",
}

/**
 * Base build function which will update common attributes to all platforms
 */
async function baseBuild(options?: electronBuilder.CliOptions) {
    const buildVersion = process.env.BUILD_NUMBER;
    const buildType = process.env.BUILD_TYPE || "dev";

    let version = `${packageDef.version}-${buildType}`;
    if (buildVersion) {
        version += `.${buildVersion}`;
    }

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
        platform: "windows",
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
        targets: electronBuilder.Platform.MAC.createTarget(["dir", "zip"]),
    });
}

/**
 * Just create the mac os app file.
 * This is so app can be signed before creating the dmg
 */
async function createDarwinDmg() {
    return baseBuild({
        targets: electronBuilder.Platform.MAC.createTarget(["dmg"]),
        prepackaged: "./release/mac",
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
        case "darwin-app":
            return createDarwinApp();
        case "darwin-dmg":
            return createDarwinDmg();
        default:
            return buildDefault();
    }
}

build().catch((err) => {
    // tslint:disable-next-line:no-console
    console.error(err);
    process.exit(1);
});
