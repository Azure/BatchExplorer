import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { FailureInfo, StartTaskInfo } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";

@Component({
    selector: "bl-start-task-error-display",
    templateUrl: "start-task-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartTaskErrorDisplayComponent implements OnChanges {
    @Input()
    public startTaskInfo: StartTaskInfo;

    public failureInfo: FailureInfo;
    public errorMessage: string;
    public errorCode: string;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.startTaskInfo) {
            if (this.startTaskInfo) {
                this.failureInfo = this.startTaskInfo && this.startTaskInfo.failureInfo;
                this._computeErrorMessage();
            } else {
                this.errorMessage = this.errorCode = "";
                this.failureInfo = null;
            }
        }
    }

    private _computeErrorMessage() {
        if (!this.failureInfo) {
            this.errorMessage = this.errorCode = "";
            return;
        }

        const decorator = new FailureInfoDecorator(this.failureInfo);
        if (decorator.exists) {
            this.errorCode = decorator.code;
            this.errorMessage = decorator.message;
        }
    }
}
