import { Injectable, OnDestroy } from "@angular/core";
import { SharedServiceInjector } from "../shared-service-injector";
import { wrapMainObservable } from "../utils";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN, AutoUpdateService } from "./base";

@Injectable({ providedIn: "root" })
export class AutoUpdateRendererService extends AutoUpdateService implements OnDestroy {

    private _main: AutoUpdateService;

    constructor(injector: SharedServiceInjector) {
        super();
        this._main = injector.get(AUTO_UPDATE_MAIN_SERVICE_TOKEN);

        this.status = wrapMainObservable(this._main.status);
        this.downloadProgress = wrapMainObservable(this._main.downloadProgress);
    }

    public ngOnDestroy() {
        // Nothing to do
    }

    public disable() {
        return this._main.disable();
    }

    public set autoInstallOnAppQuit(value: boolean) {
        this._main.autoInstallOnAppQuit = value;
    }

    public get updateInfo() {
        return this._main.updateInfo;
    }

    public setFeedUrl(value: string) {
        return this._main.setFeedUrl(value);
    }

    public quitAndInstall() {
        return this._main.quitAndInstall();
    }

    public checkForUpdates() {
        return this._main.checkForUpdates();
    }
}
