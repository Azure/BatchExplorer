import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
} from "@angular/core";
import { Activity } from "@batch-flask/ui/activity-monitor";

@Component({
    selector: "bl-activity-monitor-footer-item",
    templateUrl: "activity-monitor-footer-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorFooterItemComponent implements OnInit {
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
            this.progress = progress;
            this.changeDetector.markForCheck();
        });
    }

    public get name() {
        return this.activity.name;
    }
}
