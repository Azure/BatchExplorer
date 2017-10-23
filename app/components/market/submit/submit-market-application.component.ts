import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { NcjJobTemplate, NcjPoolTemplate } from "app/models";
import { NcjTemplateService } from "app/services";
import { log } from "app/utils";
import { Modes } from "./market-application.model";
import "./submit-market-application.scss";

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent implements OnInit {
    public static breadcrumb() {
        return { name: "Submit" };
    }
    public Modes = Modes;
    public modeState = Modes.None;
    public title: string;
    public jobTemplate: NcjJobTemplate;
    public poolTemplate: NcjPoolTemplate;
    public loaded = false;

    private applicationId: string;
    private actionId: string;
    private icon: string;

    constructor(
        private route: ActivatedRoute,
        private templateService: NcjTemplateService) {
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this.title = `Run ${this.actionId} from ${this.applicationId}`;

            this.templateService.getApplication(this.applicationId).subscribe((application) => {
                this.icon = application.icon;
                this._updateTemplates();
            });
        });
    }

    private _updateTemplates() {
        const job = this.templateService.getJobTemplate(this.applicationId, this.actionId).catch((error) => {
            log.error(`Error loading the job template for ${this.applicationId}>${this.actionId}`, error);
            return Observable.of(null);
        });
        const pool = this.templateService.getPoolTemplate(this.applicationId, this.actionId).catch((error) => {
            log.error(`Error loading the pool template for ${this.applicationId}>${this.actionId}`, error);
            return Observable.of(null);
        });
        Observable.forkJoin(job, pool).subscribe(([job, pool]) => {
            this.jobTemplate = job;
            this.poolTemplate = pool;
            this.loaded = true;
        });
    }
}
