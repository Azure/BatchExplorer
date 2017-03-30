import { BrowserWindow } from "electron";

export class AuthenticationWindow {
    private _window: Electron.BrowserWindow;

    public create() {
        this.destroy();
        this._window = new BrowserWindow({
            width: 800, height: 700, show: false,
            center: true,
            webPreferences: {
                nodeIntegration: false,
            },
        });

        // Uncomment to debug auth errors
        // this._window.webContents.openDevTools();
        this._window.setMenu(null);
    }

    public loadURL(url: string) {
        if (!this._window) {
            throw "AuthenticationWindow not created. Cannot call loadURL";
        }
        this._window.loadURL(url);
    }

    public isVisible(): boolean {
        return this._window && this._window.isVisible();
    }

    public show() {
        if (!this._window) {
            this.create();
        }
        if (!this._window.isVisible()) {
            this._window.show();
        }
    }

    public hide() {
        if (this._window) {
            this._window.hide();
        }
    }

    public destroy() {
        if (this._window) {
            this._window.destroy();
            this._window = null;
        }
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
