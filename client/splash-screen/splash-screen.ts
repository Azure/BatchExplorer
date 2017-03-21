import { BrowserWindow } from "electron";
import { Constants } from "../client-constants";

const urls = Constants.urls.splash;
const url = process.env.HOT ? urls.dev : urls.prod;

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
        this._window.loadURL(url);
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
            this._window.close();
            this._window = null;
        }
    }
}
