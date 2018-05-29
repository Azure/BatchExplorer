import { BrowserWindow } from "electron";
import { Constants } from "../client-constants";
import { UniqueWindow } from "../core";

const urls = Constants.urls.splash;
const url = process.env.HOT ? urls.dev : urls.prod;

export class SplashScreen extends UniqueWindow {
    private _currentMessage = "";

    public updateMessage(message: string) {
        this._currentMessage = message;
        this._sendMessageToWindow();
    }

    public destroy() {
        super.destroy();
        this.clearMessage();
    }

    public clearMessage() {
        this.updateMessage("");
    }

    protected createWindow() {
        const window = new BrowserWindow({
            height: 340,
            width: 340,
            icon: Constants.urls.icon,
            resizable: false,
            titleBarStyle: "hidden",
            frame: false,
            show: false,
            center: true,
        });
        window.loadURL(url);
        window.once("ready-to-show", () => {
            this.show();
        });
        window.webContents.once("dom-ready", () => {
            this._sendMessageToWindow();
        });
        return window;
    }

    private _sendMessageToWindow() {
        if (this._window) {
            this._window.webContents.send("update-message", this._currentMessage);
        }
    }
}
