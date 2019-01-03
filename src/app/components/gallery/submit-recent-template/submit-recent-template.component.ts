import { ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { NcjTemplateService, RecentSubmission } from "app/services";

import "./submit-recent-template.scss";

@Component({
    selector: "bl-submit-recent-template",
    templateUrl: "submit-recent-template.html",
})
export class SubmitRecentTemplateComponent {
    public static breadcrumb() {
        return { name: "Recent template" };
    }

    public set recentTemplateId(recentTemplateId: string) {
        this._recentTemplateId = recentTemplateId;
        this._updateTemplate();
        this.changeDetector.markForCheck();
    }
    public get recentTemplateId() {
        return this._recentTemplateId;
    }
    public error: string;
    public title: string;
    public loaded: boolean = false;

    public recentSubmission: RecentSubmission;

    private _recentTemplateId: string;

    constructor(
        private templateService: NcjTemplateService,
        public dialogRef: MatDialogRef<any>,
        private changeDetector: ChangeDetectorRef) {

    }

    private async _updateTemplate() {
        this.templateService.getRecentSubmission(this.recentTemplateId).subscribe((submission) => {
            if (!submission) {
                this.error = "Cannot find a recent template submitted with this id";
            }
            this.recentSubmission = submission;
            this.loaded = true;
            this.changeDetector.markForCheck();
        });
    }
}
