import { Injectable } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { SSHPublicKey } from "app/models";
import { List } from "immutable";
import { Observable, from } from "rxjs";
import { map, publishReplay, refCount, share, switchMap, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class SSHKeyService {
    public static readonly KEY = "ssh-pub-keys";

    public keys: Observable<List<SSHPublicKey>>;

    constructor(private storage: GlobalStorage, private fs: FileSystemService) {
        this.keys = this.storage.watch(SSHKeyService.KEY).pipe(
            map(data => Array.isArray(data) ? List(data) : List([])),
            publishReplay(1),
            refCount(),
        );
    }

    public saveKey(key: SSHPublicKey) {
        return this.keys.pipe(
            take(1),
            switchMap((formulas) => {
                return this._saveSSHPublicKeys(List<SSHPublicKey>(formulas.filter(x => {
                    return x.value !== key.value && x.id !== key.id;
                })).push(key));
            }),
            share(),
        );
    }

    public deleteKey(key: SSHPublicKey) {
        return this.keys.pipe(
            take(1),
            switchMap((formulas) => {
                return this._saveSSHPublicKeys(List(formulas.filter(x => x.id !== key.id)));
            }),
            share(),
        );
    }

    public hasLocalPublicKey(path: string): Observable<boolean> {
        return from(this.fs.exists(path));
    }

    public getLocalPublicKey(path: string): Observable<string> {
        return from(this.fs.readFile(path));
    }

    private _saveSSHPublicKeys(keys: List<SSHPublicKey> = null): Observable<any> {
        return from(this.storage.set(SSHKeyService.KEY, keys.toJS()));
    }
}
