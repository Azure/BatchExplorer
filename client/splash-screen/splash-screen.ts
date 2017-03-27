import { BrowserWindow } from "electron";
import { Constants } from "../client-constants";

const urls = Constants.urls.splash;
const url = process.env.HOT ? urls.dev : urls.prod;

export class SplashScreen {
    private _window: Electron.BrowserWindow;
    private _currentMessage = "";

    public create() {
        this.destroy();
        this._window = new BrowserWindow({
            height: 300,
            width: 300,
            icon: Constants.urls.icon,
            resizable: false,
            titleBarStyle: "hidden",
            frame: false,
        });
        this._window.loadURL(url);
        this._window.webContents.once("dom-ready", () => {
            this._sendMessageToWindow();
        });
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
        this.clearMessage();
    }

    public updateMessage(message: string) {
        this._currentMessage = message;
        this._sendMessageToWindow();
    }

    public clearMessage() {
        this.updateMessage("");
    }

    private _sendMessageToWindow() {
        if (this._window) {
            this._window.webContents.send("update-message", this._currentMessage);
        }
    }
}
