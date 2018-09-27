import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as path from "path";

import { NcjJobTemplate, NcjPoolTemplate, NcjTemplateType } from "app/models";
import { LocalTemplateService } from "app/services";
import "./submit-local-template.scss";

@Component({
    selector: "bl-submit-local-template",
    templateUrl: "submit-local-template.html",
})
export class SubmitLocalTemplateComponent implements OnInit {
    public static breadcrumb(_, queryParams) {
        return { name: path.basename(queryParams.templateFile), label: "Local templates" };
    }

    public templateFile: string;
    public error: string;
    public title: string;
    public loaded: boolean = false;

    public jobTemplate: NcjJobTemplate;
    public poolTemplate: NcjPoolTemplate;

    constructor(
        private localTemplateService: LocalTemplateService,
        private route: ActivatedRoute) {
    }

    public ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.templateFile = params["templateFile"];
            this.title = `Run template at ${path.basename(this.templateFile)}`;
            this._updateTemplate();
        });
    }

    private async _updateTemplate() {
        try {
            const { type, template } = await this.localTemplateService.loadLocalTemplateFile(this.templateFile);
            this.jobTemplate = null;
            this.poolTemplate = null;
            if (type === NcjTemplateType.Job) {
                this.jobTemplate = template;
                this.loaded = true;
            } else if (type === NcjTemplateType.Pool) {
                this.poolTemplate = template;
                this.loaded = true;
            } else {
                this.error = "Cannot determine the type of this template.";
            }
        } catch (error) {
            this.error = error;
        }
    }
}
