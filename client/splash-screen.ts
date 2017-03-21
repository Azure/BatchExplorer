import { BrowserWindow } from "electron";

const splashScreenFileUrl = `file://${__dirname}/../../client/splash-screen.html`;

export class SplashScreen {
    private _window: Electron.BrowserWindow;

    public create() {
        this.destroy();
        this._window = new BrowserWindow({
            height: 300,
            width: 300,
            titleBarStyle: "hidden",
            frame: false,
        });
        this._window.loadURL(splashScreenFileUrl);
    }

    public show() {
        this._window.show();
    }

    public hide() {
        this._window.hide();
    }

    public destroy() {
        if (this._window) {
            this._window.close();
        }
    }
}
