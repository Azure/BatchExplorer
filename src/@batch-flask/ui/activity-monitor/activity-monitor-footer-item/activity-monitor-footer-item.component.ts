import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnChanges,
} from "@angular/core";
import { Activity } from "@batch-flask/ui/activity-monitor/activity";
import { Subscription } from "rxjs";

import "./activity-monitor-footer-item.scss";

@Component({
    selector: "bl-activity-monitor-footer-item",
    templateUrl: "activity-monitor-footer-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorFooterItemComponent implements OnChanges {
    @Input() public activity: Activity;
    public progress: number;
    public progressString: string;

    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {}

    public ngOnChanges(changes) {
        if (changes.activity) {
            this._subscribeToProgress();
        }
    }

    @HostBinding("attr.title")
    public get name() {
        return this.activity.name;
    }

    public get isComplete() {
        return this.activity.isComplete;
    }

    private _subscribeToProgress() {
        if (this._sub) {
            this._sub.unsubscribe();
        }

        this._sub = this.activity.progress.subscribe((progress) => {
            this.progress = progress;
            this.progressString = `(${Math.floor(progress)}%)`;
            this.changeDetector.markForCheck();
        });
    }
}
