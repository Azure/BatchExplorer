import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { USER_CONFIGURATION_STORE, UserConfigurationStore, isNotNullOrUndefined } from "@batch-flask/core";
import { SharedServiceInjector } from "@batch-flask/electron/shared-service-injector";
import { wrapMainObservable } from "@batch-flask/electron/utils";
import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class RendererConfigurationStore<T extends {}> implements UserConfigurationStore<T>, OnDestroy {
    public config: Observable<T>;
    public _main: UserConfigurationStore<T>;
    private _sub: Subscription;

    constructor(injector: SharedServiceInjector, zone: NgZone) {
        this._main = injector.get<any>(USER_CONFIGURATION_STORE);
        this.config = wrapMainObservable(this._main.config, zone).pipe(filter(isNotNullOrUndefined));
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public save(config: T) {
        return this._main.save(config);
    }
}
