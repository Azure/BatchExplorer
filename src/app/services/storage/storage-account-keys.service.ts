import { Injectable } from "@angular/core";
import { SanitizedError } from "@batch-flask/utils";
import { StorageKeys } from "app/models";
import { ArmHttpService } from "app/services/arm-http.service";
import { of } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

export class StorageAccountKeyMissingError extends Error {
    constructor(message: string) { super(message); }
}
@Injectable({providedIn: "root"})
export class StorageAccountKeysService {
    private _cache = new Map<string, StorageKeys>();

    constructor(private arm: ArmHttpService) {

    }
    public getFor(storageAccountId: string) {
        if (!storageAccountId) {
            throw new SanitizedError(`Cannot get keys for storage account id ${storageAccountId}`);
        }
        if (this._cache.has(storageAccountId)) {
            return of(this._cache.get(storageAccountId));
        } else {
            return this._loadKeys(storageAccountId);
        }
    }

    private _loadKeys(storageAccountId: string) {
        const url = `${storageAccountId}/listkeys`;
        return this.arm.post(url).pipe(
            map(response => this._parseKeysReponse(response)),
            map((keys: StorageKeys) => {
                // bail out if we didn't get any keys
                if (!keys.primaryKey && !keys.secondaryKey) {
                    throw new StorageAccountKeyMissingError(`Failed to load storage keys for: ${storageAccountId}`);
                }
                this._cache.set(storageAccountId, keys);
                return keys;
            }),
            shareReplay(1),
        );
    }

    /**
     * Classic and Standard storage API's return different payloads for the /listkeys operation
     * @param responseJson - response JSON from the /listkeys operation
     */
    private _parseKeysReponse(responseJson) {
        if (responseJson.primaryKey) {
            // classic storage
            return new StorageKeys(responseJson);
        } else {
            // Probably new storage account type
            const keyJson: any = {};
            if (Array.isArray(responseJson.keys)) {
                keyJson.primaryKey = responseJson.keys[0] ? responseJson.keys[0].value : null;
                keyJson.secondaryKey = responseJson.keys[1] ? responseJson.keys[1].value : null;
            }
            return new StorageKeys(keyJson);
        }
    }

}
