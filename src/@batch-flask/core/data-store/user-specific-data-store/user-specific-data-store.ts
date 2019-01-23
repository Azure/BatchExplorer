import { Inject, Injectable, OnDestroy } from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { Observable, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { DataStore } from "../data-store";
import { LocalStorage } from "../local-storage";

export const USER_SERVICE = "USER_SERVICE";

export interface User {
    unique_name: string;
}

export interface UserService {
    currentUser: Observable<User>;
}
/**
 * Implementation of the browser local storage
 */
@Injectable({ providedIn: "root" })
export class UserSpecificDataStore implements DataStore, OnDestroy {
    public static KEY = "user-specific";

    private _loadPromise: Promise<any>;
    private _map = new Map<string, Map<string, any>>();
    private _destroy = new Subject();
    private _currentUser: Observable<string>;

    constructor(private localStorage: LocalStorage, @Inject(USER_SERVICE) private userService: UserService) {
        this.load();
        this._currentUser = this.userService.currentUser.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            map(x => x.unique_name),
        );
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public async setItem<T = string>(key: string, value: T) {
        await this._loadPromise;
        const userId = await this._getCurrentUser();
        let map = this._map.get(userId);

        if (!map) {
            map = new Map<string, any>();
            this._map.set(userId, map);
        }

        map.set(key, value);

        return this._save();
    }

    public async getItem<T = string>(key: string): Promise<T | undefined> {
        const userId = await this._getCurrentUser();
        const map = this._map.get(userId);
        if (map) {
            return map.get(key);
        } else {
            return undefined;
        }
    }

    public async removeItem(key: string) {
        const userId = await this._getCurrentUser();
        const map = this._map.get(userId);
        if (map) {
            map.delete(key);
        }
    }

    public async load() {
        this._loadPromise = this.localStorage.get<any>(UserSpecificDataStore.KEY).then((data) => {
            this._map = new Map();
            if (data) {
                for (const [key, value] of Object.entries(this._map)) {
                    const userMap = new Map();
                    for (const [userKey, userValue] of Object.entries(value)) {
                        userMap.set(userKey, userValue);
                    }
                    this._map.set(key, userMap);
                }
            }
        });
        return this._loadPromise;
    }

    public async clear() {
        const userId = await this._getCurrentUser();
        this._map.delete(userId);
        await this._save();
    }

    public async clearAll() {
        await this._map.clear();
        await this._save();
    }

    public get size() {
        return this._map.size;
    }

    private async _save(): Promise<void> {
        const obj = {};
        for (const [key, value] of this._map.entries()) {
            const userObj = {};
            for (const [userKey, userValue] of value.entries()) {
                userObj[userKey] = userValue;
            }
            obj[key] = userObj;
        }
        await this.localStorage.set(UserSpecificDataStore.KEY, obj);
    }

    private _getCurrentUser() {
        return this._currentUser.pipe(
            take(1),
        ).toPromise();
    }
}
