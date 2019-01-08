import { Injectable } from "@angular/core";
import { UserConfigurationStore, isNotNullOrUndefined } from "@batch-flask/core";
import { LocalFileStorage } from "client/core";
import { Constants } from "common";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class MainConfigurationStore<T extends {}> implements UserConfigurationStore<T> {
    public config: Observable<T>;
    private _config = new BehaviorSubject<T | null>(null);

    constructor(private localStorage: LocalFileStorage) {
        this.config = this._config.pipe(filter(isNotNullOrUndefined));
        this._load();
    }

    public save(config: T) {
        this._config.next(config);
        return this.localStorage.set(Constants.SavedDataFilename.settings, config);
    }

    private async _load() {
        const value = await this.localStorage.get<T>(Constants.SavedDataFilename.settings);
        this._config.next(value);
    }
}
