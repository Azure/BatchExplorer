import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import { AutoscaleFormula } from "app/models";
import { log } from "app/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { GithubDataService } from "./github-data.service";

const predefinedFormulaPath = "data/sample-autoscale-formula.json";

@Injectable()
export class PredefinedFormulaService {
    public predefinedFormulas: Observable<AutoscaleFormula[]>;
    private _predefinedFormulas = new BehaviorSubject<AutoscaleFormula[]>(null);
    constructor(private githubData: GithubDataService) {
        this.predefinedFormulas = this._predefinedFormulas.asObservable();
    }

    public init() {
        this.githubData.get(predefinedFormulaPath).subscribe({
            next: (response: Response) => {
                const data: AutoscaleFormula[] = response.json();
                this._predefinedFormulas.next(data);
            },
            error: (error) => {
                log.error("Error loading predefined formula from github", error);
            },
        });
    }
}
