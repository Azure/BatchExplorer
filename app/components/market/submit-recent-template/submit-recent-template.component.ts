import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { NcjTemplateService, RecentSubmission } from "app/services";
import "./submit-recent-template.scss";

@Component({
    selector: "bl-submit-recent-template",
    templateUrl: "submit-recent-template.html",
})
export class SubmitRecentTemplateComponent implements OnInit {
    public static breadcrumb() {
        return { name: "Recent template" };
    }

    public recentTemplateId: string;
    public error: string;
    public title: string;
    public loaded: boolean = false;

    public recentSubmission: RecentSubmission;

    constructor(
        private templateService: NcjTemplateService,
        private route: ActivatedRoute) {
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.recentTemplateId = params["id"];
            this._updateTemplate();
        });
    }

    private async _updateTemplate() {
        this.templateService.getRecentSubmission(this.recentTemplateId).subscribe((submission) => {
            if (!submission) {
                this.error = "Cannot find a recent template submitted with this id";
            }
            this.recentSubmission = submission;
            this.loaded = true;
        });
    }
}
