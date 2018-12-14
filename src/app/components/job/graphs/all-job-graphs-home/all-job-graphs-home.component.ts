import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { FormControl } from "@angular/forms";
import { FilterBuilder, autobind } from "@batch-flask/core";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";
import "./all-job-graphs-home.scss";
import { DateTime } from "luxon";

enum TimeRange {
    hour = 1,
    day = 2,
    week = 3,
}
@Component({
    selector: "bl-all-job-graphs-home",
    templateUrl: "all-job-graphs-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllJobGraphsComponent implements OnInit, OnDestroy {
    public TimeRange = TimeRange;
    public jobs: List<Job>;
    public loading = false;

    public selectedTimeRange = new FormControl(TimeRange.day);

    private _sub: Subscription;
    constructor(private jobService: JobService, private changeDetector: ChangeDetectorRef) {
        this._sub = this.selectedTimeRange.valueChanges.subscribe(() => {
            this.loading = true;
            this.changeDetector.markForCheck();
            this._loadJobs();
        });
    }

    public ngOnInit() {
        this.loading = true;
        this._loadJobs();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public refresh() {
        return this._loadJobs();
    }

    private _loadJobs() {

        const obs = this.jobService.listAll({
            select: "id,executionInfo,stats",
            filter: this._buildFilter(),
            pageSize: 1000,
        });
        obs.subscribe((jobs) => {
            this.loading = false;
            this.jobs = List(jobs.filter(x => Boolean(x.stats && x.executionInfo)));
            this.changeDetector.markForCheck();
        });
        return obs;
    }

    private _buildFilter() {
        const completedFilter = FilterBuilder.prop("state").eq(JobState.completed);
        const rangeFilter = this._getRangeFilter();
        return FilterBuilder.and(completedFilter, rangeFilter);
    }

    private _getRangeFilter() {
        let date: DateTime;
        const now = DateTime.local();
        switch (this.selectedTimeRange.value) {
            case TimeRange.hour:
                date = now.minus({ hours: 1 });
                break;
            case TimeRange.day:
                date = now.minus({ days: 1 });
                break;
            case TimeRange.week:
                date = now.minus({ weeks: 1 });
                break;
            default:
                date = now.minus({ days: 1 });
                break;
        }
        return FilterBuilder.prop("executionInfo/endTime").ge(date.toJSDate());
    }
}
