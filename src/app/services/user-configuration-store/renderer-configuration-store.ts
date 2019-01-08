import { Injectable, OnDestroy } from "@angular/core";
import { USER_CONFIGURATION_STORE, UserConfigurationStore } from "@batch-flask/core";
import { SharedServiceInjector } from "@batch-flask/electron/shared-service-injector";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Injectable()
export class RendererConfigurationStore<T extends {}> implements UserConfigurationStore<T>, OnDestroy {
    public config: Observable<T>;
    public _main: UserConfigurationStore<T>;
    private _config = new BehaviorSubject<T | null>(null);
    private _destroy = new Subject<T>();

    constructor(injector: SharedServiceInjector) {
        this._main = injector.get<any>(USER_CONFIGURATION_STORE);
        this._main.config.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this._config.next(value);
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._config.complete();
    }

    public save(config: T) {
        return this._main.save(config);
    }
}
