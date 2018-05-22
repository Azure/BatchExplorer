import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { BackgroundTask } from "../background-task.model";

@Component({
    selector: "bl-background-task-tracker-item",
    templateUrl: "background-task-tracker-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundTaskTrackerItemComponent implements OnChanges, OnDestroy {
    @Input() public task: BackgroundTask;
    public progress: number;
    public done: boolean;
    public name: string;

    private _subs: Subscription[] = [];
    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnChanges(changes) {
        if (changes.task) {
            this._listenForProgress();
        }
    }

    public ngOnDestroy() {
        this._clearSubs();
    }

    private _listenForProgress() {
        this._clearSubs();

        if (this.task) { return; }

        this._subs.push(this.task.progress.subscribe((progress) => {
            this.progress = progress;
            this.changeDetector.markForCheck();
        }));
        this._subs.push(this.task.done.subscribe((done) => {
            this.done = done;
            this.changeDetector.markForCheck();
        }));
        this._subs.push(this.task.name.subscribe((name) => {
            this.name = name;
            this.changeDetector.markForCheck();
        }));
    }

    private _clearSubs() {
        this._subs.forEach(x => x.unsubscribe());
        this._subs = [];
    }
}
