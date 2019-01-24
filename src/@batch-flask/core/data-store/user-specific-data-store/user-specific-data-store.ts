import { Inject, Injectable, OnDestroy } from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core/rxjs-operators";
import { Observable, Subject, combineLatest } from "rxjs";
import { filter, map, publishReplay, refCount, take, takeUntil } from "rxjs/operators";
import { DataStore } from "../data-store";
import { GlobalStorage } from "../global-storage";

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
    public get size() {
        return 0;
    }

    public static KEY = "user-specific";

    private _data: Observable<Map<string, Map<string, any>>>;
    private _destroy = new Subject();
    private _currentUser: Observable<string>;

    constructor(private globalStorage: GlobalStorage, @Inject(USER_SERVICE) private userService: UserService) {
        this._currentUser = this.userService.currentUser.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            map(x => x.unique_name),
            publishReplay(1),
            refCount(),
        );

        this._data = this.globalStorage.watch<any>(UserSpecificDataStore.KEY).pipe(
            map((data) => {
                return this._parseSerializedData(data);
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public async setItem<T = string>(key: string, value: T) {
        const map = await this._getCurrentData();
        const userId = await this._getCurrentUser();
        let userMap = map.get(userId);

        if (!userMap) {
            userMap = new Map<string, any>();
            map.set(userId, userMap);
        }

        userMap.set(key, value);

        return this._save();
    }

    public async getItem<T = string>(key: string): Promise<T | null> {
        const map = await this._getCurrentData();
        const userId = await this._getCurrentUser();
        const userMap = map.get(userId);
        if (userMap && userMap.has(key)) {
            return userMap.get(key)!;
        } else {
            return null;
        }
    }

    public watchItem<T = string>(key: string): Observable<T | undefined> {
        return combineLatest(this._data, this._currentUser).pipe(
            map(([map, userId]) => {
                const userMap = map.get(userId);
                if (userMap) {
                    return userMap.get(key);
                } else {
                    return undefined;
                }
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public async removeItem(key: string) {
        const map = await this._getCurrentData();
        const userId = await this._getCurrentUser();
        const userMap = map.get(userId);
        if (userMap) {
            userMap.delete(key);
        }
    }

    public async clear() {
        const userId = await this._getCurrentUser();
        const map = await this._getCurrentData();
        map.delete(userId);
        await this._save();
    }

    public async clearAll() {
        const map = await this._getCurrentData();
        await map.clear();
        await this._save();
    }

    private _getCurrentData(): Promise<Map<string, Map<string, any>>> {
        return this._data.pipe(take(1)).toPromise();
    }

    private async _save(): Promise<void> {
        const map = await this._getCurrentData();
        await this.globalStorage.set(UserSpecificDataStore.KEY, this._serializeData(map));
    }

    private _parseSerializedData(data: StringMap<StringMap<any>>): Map<string, Map<string, any>> {
        const map = new Map();
        if (data) {
            for (const [key, value] of Object.entries(data)) {
                const userMap = new Map();
                for (const [userKey, userValue] of Object.entries(value)) {
                    userMap.set(userKey, userValue);
                }
                map.set(key, userMap);
            }
        }
        return map;
    }

    private _serializeData(map: Map<string, Map<string, any>>): StringMap<StringMap<any>> {
        const obj = {};
        for (const [key, value] of map.entries()) {
            const userObj = {};
            for (const [userKey, userValue] of value.entries()) {
                userObj[userKey] = userValue;
            }
            obj[key] = userObj;
        }
        return obj;
    }

    private _getCurrentUser() {
        return this._currentUser.pipe(
            take(1),
        ).toPromise();
    }
}
