import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { GlobalStorage } from "../data-store";

export class MockGlobalStorage extends GlobalStorage {
    private _value = new BehaviorSubject({});

    public get current() {
        return this._value.value;
    }
    public save(key: string, content: string): Promise<void> {
        const map = this._value.value;
        map[key] = content;
        this._value.next(map);
        return Promise.resolve();
    }

    public watchContent(key: string) {
        return this._value.pipe(
            map(x => x[key] || null),
        );
    }
}
