import { Injectable } from "@angular/core";
import { FileUtils } from "client/api";
import { AuthenticationWindow } from "client/authentication";
import { SplashScreen } from "client/splash-screen";
import { remote } from "electron";

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable()
export class ElectronRemote {

    public get dialog(): Electron.Dialog {
        return remote.dialog;
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getCurrentWindow(): Electron.BrowserWindow {
        return remote.getCurrentWindow();
    }

    public getSplashScreen(): SplashScreen {
        return this._currentWindow().splashScreen;
    }

    public getAuthenticationWindow(): AuthenticationWindow {
        return this._currentWindow().authenticationWindow;
    }

    public getFileUtils(): FileUtils {
        return this._currentWindow().fileUtils;
    }

    private _currentWindow(): any {
        return remote.getCurrentWindow();
    }
}
