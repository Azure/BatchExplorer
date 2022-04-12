import { Directive } from "@angular/core";
import { AsyncSubject, Observable } from "rxjs";

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
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
