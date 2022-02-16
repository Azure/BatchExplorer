import { ElectronApplication, Page } from "playwright";

export function getExePath(): string {
    switch (process.platform) {
        case "win32":
            return "../release/win-unpacked/BatchExplorer.exe";
        case "darwin":
            if (process.arch === "arm64") {
                return "./release/mac-arm64/BatchExplorer.app/Contents/MacOS/BatchExplorer";
            } else {
                return "./release/mac/BatchExplorer.app/Contents/MacOS/BatchExplorer";
            }
        default:
            return "";
    }
}

/**
 * Wait until there are at least N windows open and return them in a promise
 *
 * @param windowCount The number of windows to wait for
 * @return The opened windows seen when the minimum count was reached.
 */
export async function waitForWindows(app: ElectronApplication, windowCount: number): Promise<Page[]> {
    let currWindows = app.windows();
    if (currWindows.length >= windowCount) {
        // Early out - already have the desired count
        return currWindows;
    }

    while (currWindows.length < windowCount) {
        await new Promise(resolve => setTimeout(() => {
            currWindows = app.windows();
            resolve(null);
        }, 50));
    }

    return currWindows;
}

export enum WindowType {
    auth = "auth",
    splash = "splash",
    main = "main",
    devTools = "devTools"
}

export async function getWindow(app: ElectronApplication, type: WindowType): Promise<Page> {
    const windows = await app.windows();
    const matcher = windowMatcher(type);
    for (let i = 0; i < windows.length; i++) {
        const url = windows[i].url();
        if (url && matcher(url)) {
            return windows[i];
        }
    }
    throw new Error(`Could not find window ${type}`);
}

function windowMatcher(type: WindowType): (url: string) => boolean {
    switch (type) {
        case WindowType.main:
            return url => url.indexOf("index.html") !== -1;
        case WindowType.splash:
            return url => url.indexOf("splash-screen.html") !== -1;
        case WindowType.auth:
            return url => url.startsWith("https://login.microsoftonline.com");
        case WindowType.devTools:
            return url => url.startsWith("devtools://");
    }
}
