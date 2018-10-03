import { Injectable, OnDestroy } from "@angular/core";
import { AutoUpdateService, UpdateStatus } from "./base";
import { SharedServiceInjector } from "../shared-services-injector/shared-service-injector";
import { BehaviorSubject, Subscription } from "rxjs";
import { AUTO_UPDATE_MAIN_SERVICE_TOKEN } from "./auto-update-main.service";

@Injectable()
export class AutoUpdateRendererService extends AutoUpdateService implements OnDestroy {

    private _main: AutoUpdateService;

    private _status = new BehaviorSubject(UpdateStatus.Checking);
    _sub: Subscription;

    constructor(injector: SharedServiceInjector) {
        super();
        this._main = injector.get(AUTO_UPDATE_MAIN_SERVICE_TOKEN);

        this._sub = this._main.status.subscribe((status) => {
            this._status.next(status);
        })
        this.status = this._status.asObservable();
    }

    public ngOnDestroy() {
        this._status.complete();
        this._sub.unsubscribe();
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
