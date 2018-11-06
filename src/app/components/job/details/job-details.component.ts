import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { JobDecorator } from "app/decorators";
import { Job } from "app/models";
import { JobParams, JobService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { JobCommands } from "../action";

import { flatMap } from "rxjs/operators";
import "./job-details.scss";

@Component({
    selector: "bl-job-details",
    templateUrl: "job-details.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [JobCommands],
})
export class JobDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Job - ${tab}` : "Job";
        return {
            name: id,
            label,
            icon: "tasks",
        };
    }

    public jobId: string;
    public job: Job;
    public decorator: JobDecorator;
    public data: EntityView<Job, JobParams>;
    public hasHookTask = false;

    private _paramsSubscriber: Subscription;

    constructor(
        public commands: JobCommands,
        private activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private jobService: JobService,
        private router: Router) {

        this.data = this.jobService.view();
        this.data.item.subscribe((job) => {
            this.job = job;
            this.hasHookTask = Boolean(job && job.jobPreparationTask);
            if (job) {
                this.decorator = new JobDecorator(job);
                this.changeDetector.markForCheck();
            }
        });

        this.data.deleted.subscribe((key) => {
            if (this.jobId === key) {
                this.router.navigate(["/jobs"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["id"];
            this.data.params = { id: this.jobId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    public get filterPlaceholderText() {
        return "Filter by task id";
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    @autobind()
    public updateTags(tags: List<string>) {
        return this.jobService.updateTags(this.job, tags).pipe(
            flatMap(() => this.data.refresh()),
        );
    }
}
