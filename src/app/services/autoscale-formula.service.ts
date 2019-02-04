import { Injectable } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import { AutoscaleFormula } from "app/models";
import { List } from "immutable";
import { Observable, from } from "rxjs";
import { map, publishReplay, refCount, share, switchMap, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AutoscaleFormulaService {
    public static readonly KEY = "autoscale-formula";

    public formulas: Observable<List<AutoscaleFormula>>;

    constructor(private globalStorage: GlobalStorage) {
        this.formulas = this.globalStorage.watch(AutoscaleFormulaService.KEY).pipe(
            map(data => Array.isArray(data) ? List(data) : List([])),
            publishReplay(1),
            refCount(),
        );
    }

    public saveFormula(formula: AutoscaleFormula) {
        return this.formulas.pipe(
            take(1),
            switchMap((formulas) => {
                return this._saveAutoscaleFormulas(List<AutoscaleFormula>(formulas.filter(x => {
                    return x.value !== formula.value && x.id !== formula.id;
                })).push(formula));
            }),
            share(),
        );
    }

    public deleteFormula(formula: AutoscaleFormula) {
        return this.formulas.pipe(
            take(1),
            switchMap((formulas) => {
                return this._saveAutoscaleFormulas(List(formulas.filter(x => x.id !== formula.id)));
            }),
            share(),
        );
    }

    private _saveAutoscaleFormulas(formulas: List<AutoscaleFormula>): Observable<any> {
        return from(this.globalStorage.set(AutoscaleFormulaService.KEY, formulas.toJS()));
    }
}
