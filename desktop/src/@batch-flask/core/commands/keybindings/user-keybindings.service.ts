import { Injectable } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core/data-store";
import { isNotNullOrUndefined } from "@batch-flask/core/rxjs-operators";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, share, switchMap, take } from "rxjs/operators";
import { KeyBinding } from "./keybindings.service";

export interface UserBinding {
    commandId: string;
    binding: KeyBinding | null;
}

interface SerializedUserBinding {
    commandId: string;
    binding: string | null;
}

@Injectable({ providedIn: "root" })
export class UserKeybindingsService {
    public static STORAGE_KEY = "keybindings";
    public bindings: Observable<UserBinding[]>;

    private _bindings = new BehaviorSubject<UserBinding[] | null>(null);
    constructor(private storage: GlobalStorage) {
        this.bindings = this._bindings.pipe(
            filter(isNotNullOrUndefined),
        );
        this._load();
    }

    public update(commandId: string, binding: KeyBinding | null) {
        return this.bindings.pipe(
            take(1),
            map((bindings) => {
                const found = bindings.find(x => x.commandId === commandId);
                if (found) {
                    found.binding = binding;
                    return [...bindings];
                }
                return bindings.concat([{ commandId, binding }]);
            }),
            switchMap((bindings) => this.save(bindings)),
            share(),
        );
    }

    public delete(commandId: string) {
        return this.bindings.pipe(
            take(1),
            map((bindings) => {
                return bindings.filter(x => x.commandId !== commandId);
            }),
            switchMap((bindings) => this.save(bindings)),
            share(),
        );
    }

    public save(bindings: UserBinding[]) {
        this._bindings.next(bindings);
        const serializedBindings = bindings.map(({ commandId, binding }) => {
            return { commandId, binding: binding && binding.hash };
        });
        return this.storage.set<SerializedUserBinding[]>(
            UserKeybindingsService.STORAGE_KEY, serializedBindings, { pretty: true });
    }

    private async _load() {
        const value = await this.storage.get<SerializedUserBinding[]>(UserKeybindingsService.STORAGE_KEY);
        if (value) {
            this._bindings.next(value.map(({ commandId, binding }) => {
                if (binding) {
                    return { commandId, binding: KeyBinding.parse(binding) };
                } else {
                    return { commandId, binding: null };
                }
            }));

        } else {
            this._bindings.next([]);
        }
    }
}
