import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { JobScheduleDecorator } from "app/decorators";
import { Job, JobSchedule, JobScheduleState, Pool } from "app/models";
import { JobScheduleParams, JobScheduleService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";
import { JobScheduleCommands } from "../action";

import "./job-schedule-details.scss";

@Component({
    selector: "bl-job-schedule-details",
    templateUrl: "job-schedule-details.html",
    providers: [JobScheduleCommands],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Job schedule - ${tab}` : "Job schedule";
        return {
            name: id,
            label,
            icon: "calendar",
        };
    }

    public jobScheduleId: string;
    public jobSchedule: JobSchedule;
    public decorator: JobScheduleDecorator;
    public data: EntityView<JobSchedule, JobScheduleParams>;
    public JobScheduleState = JobScheduleState;

    private _paramsSubscriber: Subscription;

    constructor(
        public commands: JobScheduleCommands,
        private activatedRoute: ActivatedRoute,
        private jobScheduleService: JobScheduleService,
        private router: Router) {

        this.data = this.jobScheduleService.view();
        this.data.item.subscribe((jobSchedule) => {
            this.jobSchedule = jobSchedule;
            if (jobSchedule) {
                this.decorator = new JobScheduleDecorator(jobSchedule);
            }
        });
        this.data.deleted.subscribe((key) => {
            if (this.jobScheduleId === key) {
                this.router.navigate(["/jobschedules"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobScheduleId = params["id"];
            this.data.params = { id: this.jobScheduleId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.commands.get(this.jobScheduleId);
    }

    @autobind()
    public updateTags(tags: List<string>) {
        return this.jobScheduleService.updateTags(this.jobSchedule, tags).pipe(
            flatMap(() => this.refresh()),
        );
    }

    public get jobSpecification(): Job {
        if (!this.jobSchedule.jobSpecification) {
            return null;
        }
        return this.jobSchedule.jobSpecification;
    }

    public get autoPoolSpecification() {
        if (!this.jobSchedule.jobSpecification) {
            return null;
        }
        if (!this.jobSchedule.jobSpecification.poolInfo) {
            return null;
        }
        return this.jobSchedule.jobSpecification.poolInfo.autoPoolSpecification;
    }

    public get autoPool(): Pool {
        if (!this.autoPoolSpecification) {
            return null;
        }
        return new Pool(this.autoPoolSpecification.pool as any);
    }
}
