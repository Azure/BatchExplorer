import { Injectable } from "@angular/core";
import { AutoscaleFormula } from "app/models";
import { Constants, log } from "app/utils";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

const filename = Constants.SavedDataFilename.autosacleFormula;

@Injectable()
export class AutoscaleFormulaService {
    public formulas: Observable<List<AutoscaleFormula>>;

    private _formulas = new BehaviorSubject<List<AutoscaleFormula>>(List([]));

    constructor() {
        this.formulas = this._formulas.asObservable();
    }

    public init() {
        return this.loadInitialData().subscribe((formulas) => {
            this._formulas.next(formulas);
        });
    }

    public saveFormula(formula: AutoscaleFormula) {
        const formulas = List<AutoscaleFormula>(this._formulas.value.filter(x => {
            return x.value !== formula.value && x.id !== formula.id;
        }));
        this._formulas.next(formulas.push(formula));
        this._saveAutoscaleFormulas();
    }

    public deleteFormula(formula: AutoscaleFormula) {
        this._formulas.next(List<AutoscaleFormula>(this._formulas.value.filter(x => x.id !== formula.id)));
        this._saveAutoscaleFormulas();
    }

    public loadInitialData(): Observable<List<AutoscaleFormula>> {
        const sub = new AsyncSubject();
        storage.get(filename, (error, data) => {
            if (error) {
                log.error("Error retrieving autoscale formulas");
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

    private _saveAutoscaleFormulas(formulas: List<AutoscaleFormula> = null): Observable<any> {
        let sub = new AsyncSubject();

        formulas = formulas === null ? this._formulas.value : formulas;
        storage.set(filename, formulas.toJS(), (error) => {
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
