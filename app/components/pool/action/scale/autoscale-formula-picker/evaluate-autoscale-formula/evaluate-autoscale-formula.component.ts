import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { AutoScaleFormulaEvaluation, NameValuePair, Pool } from "app/models";
import { PoolService } from "app/services";
import { AutoScaleRunError } from "azure-batch/typings/lib/models";
import { List } from "immutable";

import "./evaluate-autoscale-formula.scss";

@Component({
    selector: "bl-evaluate-autoscale-formula",
    templateUrl: "evaluate-autoscale-formula.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluateAutoScaleForumlaComponent {
    @Input() public formula: string;
    @Input() public pool: Pool;

    public evaluating = false;
    public evaluationResults: List<NameValuePair> = List([]);
    public evaluationError: ServerError;

    constructor(private poolService: PoolService, private changeDetector: ChangeDetectorRef) {
        this.changeDetector.markForCheck();
    }

    public get canEvaluateFormula() {
        return this.pool && this.pool.enableAutoScale;
    }

    public evaluateFormula() {
        if (!this.canEvaluateFormula || !this.formula) {
            return;
        }
        this.evaluating = true;
        this.changeDetector.markForCheck();
        this.poolService.evaluateAutoScale(this.pool.id, this.formula).subscribe({
            next: (value: AutoScaleFormulaEvaluation) => {
                this.evaluationResults = value.results;
                this.evaluationError = value.error;
                this.evaluating = false;
                this.changeDetector.markForCheck();
            },
            error: (error) => {
                this.evaluating = false;
                log.error("Error while evaluating autoscale formula", error);
            },
        });
    }

    public trackEvaluationErrors(index, error: AutoScaleRunError) {
        return index;
    }

    public trackEvaluationResult(index, result: string) {
        return result;
    }
}
