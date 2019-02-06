import { Injectable } from "@angular/core";
import { GlobalStorage, UserConfigurationStore, isNotNullOrUndefined } from "@batch-flask/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class MainConfigurationStore<T extends {}> implements UserConfigurationStore<T> {
    public static readonly KEY = "settings";

    public config: Observable<T>;
    private _config = new BehaviorSubject<T | null>(null);

    constructor(private storage: GlobalStorage) {
        this.config = this._config.pipe(filter(isNotNullOrUndefined));
        this._load();
    }

    public save(config: T) {
        this._config.next(config);
        return this.storage.set(MainConfigurationStore.KEY, config, { pretty: true });
    }

    private async _load() {
        const value = await this.storage.get<T>(MainConfigurationStore.KEY);
        this._config.next(value);
    }
}
