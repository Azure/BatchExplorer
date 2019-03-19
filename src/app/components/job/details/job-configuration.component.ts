import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { WorkspaceService } from "@batch-flask/ui";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditMetadataFormComponent } from "app/components/common/edit-metadata-form";
import {
    JobDecorator,
} from "app/decorators";
import { Job, Metadata, NameValuePair } from "app/models";
import { JobPatchDto } from "app/models/dtos";
import { JobService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-configuration",
    templateUrl: "job-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobConfigurationComponent implements OnDestroy {
    @Input()
    public set job(job: Job) {
        this._job = job;
        this.refresh(job);
    }
    public get job() { return this._job; }

    public decorator: JobDecorator = { usesTaskDependencies: false } as any;
    public constraints: any = {};
    public executionInfo: any = {};
    public environmentSettings: List<NameValuePair> = List([]);
    public jobMetadata: List<Metadata> = List([]);
    public poolInfo: any = {};
    public jsonViewEnabled = true;

    private _sub: Subscription;
    private _job: Job;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private jobService: JobService,
        private sidebarManager: SidebarManager,
        private workspaceService: WorkspaceService) {

        this._sub = this.workspaceService.currentWorkspace.subscribe((ws) => {
            if (ws) {
                this.jsonViewEnabled = ws.isFeatureEnabled("job.configuration.json");
                this.changeDetector.markForCheck();
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public editMetadata() {
        const id = this.job.id;
        const ref = this.sidebarManager.open(`edit-job-metadata-${id}`, EditMetadataFormComponent);
        ref.component.metadata = this.job.metadata;
        ref.component.save = (metadata) => {
            return this.jobService.patch(id, new JobPatchDto({ metadata } as any)).pipe(
                flatMap(() => this.jobService.get(id)),
            );
        };
    }

    public refresh(job: Job) {
        if (this.job) {
            this.decorator = new JobDecorator(this.job);
            this.constraints = this.decorator.constraints || {};
            this.executionInfo = this.decorator.executionInfo || {};
            this.poolInfo = this.decorator.poolInfo || {};
            this.environmentSettings = this.job.commonEnvironmentSettings;
            this.jobMetadata = this.job.metadata;
        }
    }
}
