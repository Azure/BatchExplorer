import { Injectable } from "@angular/core";
import { BatchClientProxyFactory } from "client/api";
import { StorageClientProxyFactory } from "client/api";
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

    public getBatchClientFactory(): BatchClientProxyFactory {
        return this._currentWindow().batchClientFactory;
    }

    public getStorageClientFactory(): StorageClientProxyFactory {
        return this._currentWindow().storageClientFactory;
    }

    private _currentWindow(): any {
        return remote.getCurrentWindow();
    }
}
