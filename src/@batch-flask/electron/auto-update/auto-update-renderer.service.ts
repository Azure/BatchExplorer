import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { SharedServiceInjector } from "../shared-service-injector";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN } from "./auto-update-main.service";
import { AutoUpdateService, UpdateStatus } from "./base";

@Injectable()
export class AutoUpdateRendererService extends AutoUpdateService implements OnDestroy {

    private _main: AutoUpdateService;

    private _status = new BehaviorSubject(UpdateStatus.Checking);
    private _downloadProgress = new BehaviorSubject(null);
    private _statusSub: Subscription;
    private _downloadProgressSub: Subscription;

    constructor(injector: SharedServiceInjector) {
        super();
        this._main = injector.get(AUTO_UPDATE_MAIN_SERVICE_TOKEN);

        this._statusSub = this._main.status.subscribe((status) => {
            this._status.next(status);
        });
        this._downloadProgressSub = this._main.downloadProgress.subscribe((progress) => {
            this._downloadProgress.next(progress);
        });
        this.status = this._status.asObservable();
        this.downloadProgress = this._downloadProgress.asObservable();
    }

    public ngOnDestroy() {
        this._status.complete();
        this._statusSub.unsubscribe();
        this._downloadProgressSub.unsubscribe();
    }

    public disable() {
        return this._main.disable();
    }

    public set autoInstallOnAppQuit(value: boolean) {
        this._main.autoInstallOnAppQuit = value;
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
