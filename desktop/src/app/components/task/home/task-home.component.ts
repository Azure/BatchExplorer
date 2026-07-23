import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Subscription } from "rxjs";
import { AddTaskFormComponent } from "../action";

@Component({
    standalone: false,
    selector: "bl-task-home",
    templateUrl: "task-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskHomeComponent implements OnInit, OnDestroy {
    public quickSearchQuery = new UntypedFormControl();

    public jobId: string;

    private _paramsSubscriber: Subscription;

    constructor(
        formBuilder: UntypedFormBuilder,
        private sidebarManager: SidebarManager,
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public addTask() {
        const createRef = this.sidebarManager.open("add-task", AddTaskFormComponent);
        createRef.component.jobId = this.jobId;
    }
}
