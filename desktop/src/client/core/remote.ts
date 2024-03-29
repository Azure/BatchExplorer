import type { BrowserWindow } from "electron";

let remoteInitialized = false;

export function enableRemoteForWindow(window: BrowserWindow): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const remote = require("@electron/remote/main");
    if (!remoteInitialized) {
        remote.initialize();
        remoteInitialized = true;
    }
    remote.enable(window.webContents);
}
