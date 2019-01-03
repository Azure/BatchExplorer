import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { AutoscaleFormula } from "app/models";
import { BehaviorSubject, Observable } from "rxjs";
import { GithubDataService } from "./github-data";

const indexFile = "index.json";
const predefinedFormulaPath = "data/autoscale-formula/";

interface SampleFormulaIndex {
    name: string;
    value: string;
}

@Injectable({providedIn: "root"})
export class PredefinedFormulaService {
    public predefinedFormulas: Observable<AutoscaleFormula[]>;
    private _predefinedFormulas = new BehaviorSubject<AutoscaleFormula[]>(null);

    constructor(private githubData: GithubDataService) {
        this.predefinedFormulas = this._predefinedFormulas.asObservable();
    }

    public init() {
        this.githubData.get(`${predefinedFormulaPath}${indexFile}`).subscribe({
            next: (response: string) => {
                const result: AutoscaleFormula[] = new Array();
                const data: SampleFormulaIndex[] = JSON.parse(response);
                for (const file of data) {
                    const filePath = `${predefinedFormulaPath}${file.value}`;
                    this._getPredefinedFormula(filePath, file.name, result);
                }
                this._predefinedFormulas.next(result);
            },
            error: (error) => {
                log.error("Error loading predefined formula from github", error);
            },
        });
    }

    private _getPredefinedFormula(path: string, fileName: string, resultArray: AutoscaleFormula[]) {
        this.githubData.get(path).subscribe({
            next: (fileResponse) => {
                const text: string = fileResponse;
                const formula: AutoscaleFormula = new AutoscaleFormula({
                    name: fileName,
                    value: text,
                });
                resultArray.push(formula);
            },
            error: (error) => {
                log.error(`Error ${fileName} from github`, error);
            },
        });
    }
}
