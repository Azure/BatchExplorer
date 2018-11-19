import { Component } from "@angular/core";
import { forkJoin, of } from "rxjs";

import { log } from "@batch-flask/utils";
import { NcjJobTemplate, NcjPoolTemplate, NcjTemplateMode } from "app/models";
import { NcjTemplateService } from "app/services";
import { catchError } from "rxjs/operators";
import "./submit-market-application.scss";

export interface GallerySubmissionConfig {
    applicationId: string;
    actionId: string;
}

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent {
    public static breadcrumb() {
        return { name: "Submit" };
    }
    public NcjTemplateMode = NcjTemplateMode;
    public modeState = NcjTemplateMode.None;
    public title: string;
    public jobTemplate: NcjJobTemplate;
    public poolTemplate: NcjPoolTemplate;
    public loaded = false;

    private applicationId: string;
    private actionId: string;

    constructor(
        private templateService: NcjTemplateService) {
    }

    public configure(config: GallerySubmissionConfig) {
        this.applicationId = config.applicationId;
        this.actionId = config.actionId;

        this.title = `Run ${this.actionId} from ${this.applicationId}`;

        this.templateService.getApplication(this.applicationId).subscribe((application) => {
            this._updateTemplates();
        });
    }

    private _updateTemplates() {
        const job = this.templateService.getJobTemplate(this.applicationId, this.actionId).pipe(catchError((error) => {
            log.error(`Error loading the job template for ${this.applicationId}>${this.actionId}`, error);
            return of(null);
        }));
        const pool = this.templateService.getPoolTemplate(this.applicationId, this.actionId).pipe(
            catchError((error) => {
                log.error(`Error loading the pool template for ${this.applicationId}>${this.actionId}`, error);
                return of(null);
            }),
        );
        forkJoin(job, pool).subscribe(([job, pool]) => {
            this.jobTemplate = job;
            this.poolTemplate = pool;
            this.loaded = true;
        });
    }
}
