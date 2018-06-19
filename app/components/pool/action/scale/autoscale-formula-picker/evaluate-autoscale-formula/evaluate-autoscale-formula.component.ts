import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";

import "./evaluate-autoscale-formula.scss";

@Component({
    selector: "bl-evaluate-autoscale-formula",
    templateUrl: "evaluate-autoscale-formula.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluateAutoScaleForumlaComponent {
    @Input() public formula: string;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.changeDetector.markForCheck();
    }
}
