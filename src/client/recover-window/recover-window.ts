import { BrowserWindow, nativeImage } from "electron";
import { Constants } from "../client-constants";
import { UniqueWindow } from "../core";

const urls = Constants.urls.recover;
const url = process.env.HOT ? urls.dev : urls.prod;

export class RecoverWindow extends UniqueWindow {
    private _currentMessage = "";

    public createWithError(message: string) {
        this.create();
        this.updateErrorMessage(message);
    }

    public updateErrorMessage(message: string) {
        this._currentMessage = message;
        this._sendMessageToWindow();
    }

    public destroy() {
        super.destroy();
        this.clearMessage();
    }

    public clearMessage() {
        this.updateErrorMessage("");
    }

    protected createWindow() {
        const window = new BrowserWindow({
            height: 440,
            width: 440,
            icon: nativeImage.createFromDataURL(Constants.urls.icon),
            resizable: false,
            titleBarStyle: "hidden",
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            },
        });
        window.loadURL(url);
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
