import { Inject, Injectable, OnDestroy } from "@angular/core";
import { deepMerge } from "@batch-flask/utils";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, take, takeUntil } from "rxjs/operators";
import { isNotNullOrUndefined } from "../rxjs-operators";

export const USER_CONFIGURATION_STORE = "USER_CONFIGURATION_STORE";
export const DEFAULT_USER_CONFIGURATION = "DEFAULT_USER_CONFIGURATION";

export enum EntityConfigurationView {
    JSON = "json",
    Pretty = "pretty",
}

export interface BatchFlaskUserConfiguration {
    timezone?: string;

    entityConfiguration?: {
        defaultView?: EntityConfigurationView,
    };

    fileAssociations?: Array<{extension: string, type: string}>;
}

export interface UserConfigurationStore<T> {
    config: Observable<T>;

    save(config: T): Promise<any>;
}

@Injectable({ providedIn: "root" })
export class UserConfigurationService<T extends BatchFlaskUserConfiguration> implements OnDestroy {
    public config: Observable<T>;
    public current: T | null;

    private _config = new BehaviorSubject<Partial<T> | null>({} as any);
    private _destroy = new Subject<T>();

    constructor(
        @Inject(USER_CONFIGURATION_STORE) private store: UserConfigurationStore<T>,
        @Inject(DEFAULT_USER_CONFIGURATION) defaultConfig: T) {

        this.config = this._config.pipe(
            filter(isNotNullOrUndefined),
            distinctUntilChanged((a, b) => a === b || JSON.stringify(a) === JSON.stringify(b)),
            map((userConfig) => {
                return deepMerge(defaultConfig, userConfig);
            }),
        );

        this.config.pipe(takeUntil(this._destroy)).subscribe(x => this.current = x);

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
        const newConfig = { ...this._config.value, [key]: value } as any;
        this._config.next(newConfig);
        return this._save();
    }

    public get<K extends keyof T>(key: K): Promise<T[K]> {
        return this.config.pipe(
            take(1),
            map(x => x[key]),
        ).toPromise();
    }

    public watch<K extends keyof T>(key: K): Observable<T[K]> {
        return this.config.pipe(
            map(x => x[key]),
            distinctUntilChanged(),
        );
    }

    public patch(config: Partial<T>) {
        this._config.next({ ...this._config.value, ...config });
        return this._save();
    }

    public reset() {
        this._config.next({} as any);
        return this._save();
    }

    private _save() {
        return this.store.save(this._config.value! as any);
    }
}
