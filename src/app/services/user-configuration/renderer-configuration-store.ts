import { Injectable, OnDestroy } from "@angular/core";
import { USER_CONFIGURATION_STORE, UserConfigurationStore, isNotNullOrUndefined } from "@batch-flask/core";
import { SharedServiceInjector } from "@batch-flask/electron/shared-service-injector";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class RendererConfigurationStore<T extends {}> implements UserConfigurationStore<T>, OnDestroy {
    public config: Observable<T>;
    public _main: UserConfigurationStore<T>;
    private _config = new BehaviorSubject<T | null>(null);
    private _sub: Subscription;

    constructor(injector: SharedServiceInjector) {
        this._main = injector.get<any>(USER_CONFIGURATION_STORE);
        this.config = this._config.pipe(filter(isNotNullOrUndefined));
        this._sub = this._main.config.subscribe((value) => {
            this._config.next(value);
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
        this._config.complete();
    }

    public save(config: T) {
        return this._main.save(config);
    }
}
