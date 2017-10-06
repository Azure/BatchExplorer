import { Component, Input } from "@angular/core";

import { Job } from "app/models";

@Component({
    selector: "bl-job-stats-preview",
    templateUrl: "job-stats-preview.html",
})
export class JobStatsPreviewComponent {
    @Input()
    public job: Job;

    private failed: number;
    constructor() {
        this.failed = Math.floor(Math.random() * 4);
    }
    public get stats() {
        return {
            completed: 120,
            failed: this.failed,
            total: 430,
        };
    }

    public get completionPercent() {
        return Math.floor((this.stats.completed / this.stats.total * 100));
    }

    public get tooltipMessages() {
        return {
            taskCompleted: `Job has completed ${this.completionPercent}% of its tasks.`,
            taskFailed: `Job has ${this.stats.failed} tasks that failed.`,
        };
    }
}
