import { UniqueWindow } from "client/core";
import { BrowserWindow } from "electron";

export class AuthenticationWindow extends UniqueWindow {
    public createWindow() {
        const window = new BrowserWindow({
            width: 800, height: 700, show: false,
            center: true,
            webPreferences: {
                nodeIntegration: false,
            },
        });

        // Uncomment to debug auth errors
        // window.webContents.openDevTools();
        window.setMenu(null);
        return window;
    }

    public loadURL(url: string) {
        if (!this._window) {
            throw new Error("AuthenticationWindow not created. Cannot call loadURL");
        }
        this._window.loadURL(url);
    }

    public onRedirect(callback: (newUrl: string) => void) {
        this._window.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
            callback(newUrl);
        });
    }

    public onClose(callback: () => void) {
        this._window.on("close", (event) => {
            callback();
        });
    }
}
