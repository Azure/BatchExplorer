import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
} from "@angular/core";
import { Activity } from "@batch-flask/ui/activity-monitor/activity";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-activity-monitor-footer-item",
    templateUrl: "activity-monitor-footer-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorFooterItemComponent implements OnChanges {
    @Input() public activity: Activity;
    public progress: number;

    private _progressString: string;
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {}

    public ngOnChanges(changes) {
        if (changes.activity) {
            this._subscribeToProgress();
        }
    }

    public get name() {
        return this.activity.name;
    }

    public get isComplete() {
        return this.activity.isComplete;
    }

    public prettyPrint() {
        return `${this.name.slice(0, 20)}... ${this._progressString}`;
    }

    private _subscribeToProgress() {
        if (this._sub && this._sub.closed) {
            this._sub.unsubscribe();
        }

        this._sub = this.activity.progress.subscribe((progress) => {

            this.progress = progress;
            this._progressString = `(${Math.floor(progress)}%)`;
            this.changeDetector.markForCheck();
        });
    }
}
