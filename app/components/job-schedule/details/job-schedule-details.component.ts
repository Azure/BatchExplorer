import { Component, OnDestroy, OnInit } from "@angular/core";
// import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "app/core";
import { remote } from "electron";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Job, JobSchedule, JobScheduleState, Pool } from "app/models";
import { JobScheduleDecorator } from "app/models/decorators";
import { FileSystemService, JobScheduleParams, JobScheduleService } from "app/services";
import { EntityView } from "app/services/core";
// import { SidebarManager } from "../../base/sidebar";

import "./job-schedule-details.scss";

@Component({
    selector: "bl-job-schedule-details",
    templateUrl: "job-schedule-details.html",
})
export class JobScheduleDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        let label = tab ? `Job schedule - ${tab}` : "Job schedule";
        return {
            name: id,
            label,
            icon: "tasks",
        };
    }

    public jobScheduleId: string;
    public jobSchedule: JobSchedule;
    public decorator: JobScheduleDecorator;
    public data: EntityView<JobSchedule, JobScheduleParams>;
    public JobScheduleState = JobScheduleState;
    public hasHookTask = false;

    private _paramsSubscriber: Subscription;

    constructor(
        // private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private fs: FileSystemService,
        // private sidebarManager: SidebarManager,
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
        return this.data.refresh();
    }

    @autobind()
    public updateTags(tags: List<string>) {
        return this.jobScheduleService.updateTags(this.jobSchedule, tags).flatMap(() => {
            return this.data.refresh();
        });
    }

    @autobind()
    public exportAsJSON() {
        const dialog = remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${this.jobScheduleId}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(this.jobSchedule._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }

    public get jobSpecification(): Job {
        if (!this.jobSchedule.jobSpecification) {
            return null;
        }
        return new Job(this.jobSchedule.jobSpecification);
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
        return new Pool(this.autoPoolSpecification.pool);
    }
}
