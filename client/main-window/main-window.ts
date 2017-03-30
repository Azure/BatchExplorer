import { Constants } from "client/client-constants";
import { BrowserWindow } from "electron";

export class MainWindow {
    private _window: Electron.BrowserWindow;

    constructor() {
        this._create();
    }

    private _create() {
        this._window = new BrowserWindow({
            height: 1000,
            icon: Constants.urls.icon,
            width: 1600,
            show: true, // Don't show the window until the user authenticated, comment to debug auth problems,
            webPreferences: {
                webSecurity: false,
            },
        });
    }
}
