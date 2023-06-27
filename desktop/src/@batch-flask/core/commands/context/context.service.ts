import { Injectable } from "@angular/core";

export type CommandContext = Map<string, any>;

@Injectable({ providedIn: "root" })
export class ContextService {
    private _current: CommandContext = new Map();

    public setContext(key: string, value: any) {
        this._current.set(key, value);
    }

    public removeContext(key: string) {
        this._current.delete(key);
    }

    public get context() {
        return this._current;
    }
}
