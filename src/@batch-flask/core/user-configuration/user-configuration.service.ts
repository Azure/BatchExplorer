import { Inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

export const USER_CONFIGURATION_STORE = "USER_CONFIGURATION_STORE";

export interface UserConfigurationStore<T> {
    config: Observable<T>;

    save(config: T): Promise<any>;
}
@Injectable({ providedIn: "root" })
export class UserConfigurationService<T extends {}> implements OnDestroy {
    public config: Observable<T>;

    private _config = new BehaviorSubject<T>({} as any);
    private _destroy = new Subject<T>();

    constructor(@Inject(USER_CONFIGURATION_STORE) private store: UserConfigurationStore<T>) {
        this.config = this._config.pipe(distinctUntilChanged());
        this.store.config.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this._config.next(value);
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._config.complete();
    }

    public async set<K extends keyof T>(key: K, value: T[K]) {
        const newConfig = { ...this._config.value, [key]: value };
        this._config.next(newConfig);
        return this._save();
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this._config.value[key];
    }

    public get current(): T {
        return this._config.value;
    }

    private _save() {
        return this.store.save(this._config.value);
    }
}
