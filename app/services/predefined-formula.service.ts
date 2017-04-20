import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import { AutoscaleFormula } from "app/models";
import { log } from "app/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { GithubDataService } from "./github-data.service";

const indexFile = "index.json";
const predefinedFormulaPath = "data/autoscale-formula/";

interface SampleFormulaIndex {
    name: string;
    value: string;
}

@Injectable()
export class PredefinedFormulaService {
    public predefinedFormulas: Observable<AutoscaleFormula[]>;
    private _predefinedFormulas = new BehaviorSubject<AutoscaleFormula[]>(null);
    constructor(private githubData: GithubDataService) {
        this.predefinedFormulas = this._predefinedFormulas.asObservable();
    }

    public init() {
        this.githubData.get(`${predefinedFormulaPath}${indexFile}`).subscribe({
            next: (response: Response) => {
                const result: AutoscaleFormula[] = new Array();
                const data: SampleFormulaIndex[] = response.json();
                for (let file of data) {
                    this.githubData.get(`${predefinedFormulaPath}${file.value}`).subscribe({
                        next: (fileResponse: Response) => {
                            const text: string = fileResponse.text();
                            const formula = <AutoscaleFormula>{
                                name: file.name,
                                value: text,
                            };
                            result.push(formula);
                        },
                        error: (error) => {
                            log.error(`Error ${file.value} from github`, error);
                        },
                    });
                }
                this._predefinedFormulas.next(result);
            },
            error: (error) => {
                log.error("Error loading predefined formula from github", error);
            },
        });
    }
}
