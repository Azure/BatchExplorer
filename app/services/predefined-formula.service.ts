import { Injectable } from "@angular/core";
import { AutoscaleFormula } from "app/models";
import * as SampleFormulas from "app/utils/sample-formulas";

@Injectable()
export class PredefinedFormulaService {
    public getFormulas(): AutoscaleFormula[]{
        return SampleFormulas.predefinedFormulas;
    }
}
