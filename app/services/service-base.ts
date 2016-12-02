import { BehaviorSubject, Observable } from "rxjs";

export default class ServiceBase {
    private _defaultPageSize: number = 25;
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public get maxResults(): number {
        return this._defaultPageSize;
    }

    public get loading(): Observable<boolean> {
        return this._loading.asObservable();
    }

    public setLoadingState(loading: boolean) {
        this._loading.next(loading);
    }
}
