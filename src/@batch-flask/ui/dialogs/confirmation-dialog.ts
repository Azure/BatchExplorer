import { AsyncSubject, Observable } from "rxjs";

export class ConfirmationDialog<TOutput> {
    public onSubmit: Observable<TOutput>;
    private _onSubmit = new AsyncSubject<TOutput>();

    constructor() {
        this.onSubmit = this._onSubmit.asObservable();
    }

    public markAsConfirmed(output?: TOutput) {
        this._onSubmit.next(output);
        this._onSubmit.complete();
    }
}
