export enum Platform {
    Windows = "win32",
    OSX = "darwin",
    Linux = "linux",
    Browser = "browser",
}

let platform;

if (typeof process !== "undefined") {
    platform = process.platform;
} else {
    platform = Platform.Browser;
}

export class OS {
    public static platform: Platform = platform;

    public static isWindows(): boolean {
        return platform === "win32";
    }

    public static isOSX(): boolean {
        return platform === "darwin";
    }

    public static isLinux(): boolean {
        return platform === "linux";
    }
}
