const platform = process.platform;

export class OS {
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
