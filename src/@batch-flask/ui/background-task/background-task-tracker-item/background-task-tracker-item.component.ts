import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
} from "@angular/core";
import { Activity } from "@batch-flask/ui/activity-monitor";

@Component({
    selector: "bl-background-task-tracker-item",
    templateUrl: "background-task-tracker-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundTaskTrackerItemComponent implements OnInit {
    @Input() public activity: Activity;
    public done: boolean;
    public progress: number;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.done = false;

        this.activity.done.subscribe(() => {
            this.done = true;
            this.changeDetector.markForCheck();
        });

        this.activity.progress.subscribe((progress) => {
            console.log(progress);
            this.progress = progress;
            this.changeDetector.markForCheck();
        });
    }

    public get name() {
        return this.activity.name;
    }
}
