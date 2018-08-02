import { Injectable } from "@angular/core";
import { AutoscaleFormula } from "app/models";
import { Constants, log } from "app/utils";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";
import { LocalFileStorage } from "./local-file-storage.service";
import { map, catchError } from "rxjs/operators";

const filename = Constants.SavedDataFilename.autosacleFormula;

@Injectable()
export class AutoscaleFormulaService {
    public formulas: Observable<List<AutoscaleFormula>>;

    private _formulas = new BehaviorSubject<List<AutoscaleFormula>>(List([]));

    constructor(private localFileStorage: LocalFileStorage) {
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
        return this.localFileStorage.get(filename).pipe(
            map(data => Array.isArray(data) ? List(data) : List([])),
            catchError<any, any>((error) => {
                log.error("Error retrieving autoscale formulas");
                return null;
            }),
        );
    }

    private _saveAutoscaleFormulas(formulas: List<AutoscaleFormula> = null): Observable<any> {
        const sub = new AsyncSubject();
        formulas = formulas === null ? this._formulas.value : formulas;
        this.localFileStorage.set(filename, formulas.toJS()).subscribe({
            error: (error) => {
                log.error("Error saving accounts", error);
                sub.error(error);
            },
        });
        return sub;
    }
}
