import { Injectable } from "@angular/core";
import { SSHPublicKey } from "app/models";
import { Constants, log } from "app/utils";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

const filename = Constants.SavedDataFilename.sshPublicKeys;

@Injectable()
export class SSHKeyService {
    public keys: Observable<List<SSHPublicKey>>;

    private _keys = new BehaviorSubject<List<SSHPublicKey>>(List([]));

    constructor() {
        this.keys = this._keys.asObservable();
    }

    public init() {
        return this.loadInitialData().subscribe((keys) => {
            this._keys.next(keys);
        });
    }

    public saveKey(key: SSHPublicKey) {
        const keys = List<SSHPublicKey>(this._keys.value.filter(x => {
            return x.value !== key.value && x.id !== key.id;
        }));
        this._keys.next(keys.push(key));
        this._saveSSHPublicKeys();
    }

    public deleteKey(key: SSHPublicKey) {
        this._keys.next(List<SSHPublicKey>(this._keys.value.filter(x => x.id !== key.id)));
        this._saveSSHPublicKeys();
    }

    public loadInitialData(): Observable<List<SSHPublicKey>> {
        const sub = new AsyncSubject<List<SSHPublicKey>>();
        storage.get(filename, (error, data) => {
            if (error) {
                log.error("Error retrieving ssh public keys");
                sub.error(error);
            }

            if (Array.isArray(data)) {
                sub.next(List(data));
            } else {
                sub.next(List([]));
            }

            sub.complete();
        });
        return sub.asObservable();
    }

    private _saveSSHPublicKeys(keys: List<SSHPublicKey> = null): Observable<any> {
        let sub = new AsyncSubject();

        keys = keys === null ? this._keys.value : keys;
        storage.set(filename, keys.toJS(), (error) => {
            if (error) {
                log.error("Error saving accounts", error);
                sub.error(error);
            }

            sub.next(true);
            sub.complete();
        });

        return sub;
    }
}
