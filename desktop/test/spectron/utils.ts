export function getExePath(): string  {
    switch (process.platform) {
        case "win32":
            return "./release/win-unpacked/BatchExplorer.exe";
        case "darwin":
            return "./release/mac/BatchExplorer.app/Contents/MacOS/BatchExplorer";
        default:
            return "";
    }
}
