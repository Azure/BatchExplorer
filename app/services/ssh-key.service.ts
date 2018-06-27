import { Injectable } from "@angular/core";
import { List } from "immutable";

import { SSHPublicKey } from "app/models";
import { Constants } from "app/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { FileSystemService } from "./fs.service";
import { LocalFileStorage } from "./local-file-storage.service";

const filename = Constants.SavedDataFilename.sshPublicKeys;

@Injectable()
export class SSHKeyService {
    public keys: Observable<List<SSHPublicKey>>;

    private _keys = new BehaviorSubject<List<SSHPublicKey>>(List([]));

    constructor(private storage: LocalFileStorage, private fs: FileSystemService) {
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
        return this.storage.get(filename).map((data) => {
            if (Array.isArray(data)) {
                return List(data);
            } else {
                return List([]);
            }
        });
    }

    public hasLocalPublicKey(): Observable<boolean> {
        const homedir = this.fs.commonFolders.home;
        return Observable.fromPromise(this.fs.exists(`${homedir}/.ssh/id_rsa.pub`));
    }

    public getLocalPublicKey(): Observable<string> {
        const homedir = this.fs.commonFolders.home;
        return Observable.fromPromise(this.fs.readFile(`${homedir}/.ssh/id_rsa.pub`));
    }

    private _saveSSHPublicKeys(keys: List<SSHPublicKey> = null): Observable<any> {
        keys = keys === null ? this._keys.value : keys;
        return this.storage.set(filename, keys.toJS());
    }
}
