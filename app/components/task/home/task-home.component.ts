import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { SidebarManager } from "../../base/sidebar";
import { TaskCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bl-task-home",
    templateUrl: "task-home.html",
})
export class TaskHomeComponent implements OnInit, OnDestroy {
    public quickSearchQuery = new FormControl();

    public jobId: string;

    private _paramsSubscriber: Subscription;

    constructor(
        formBuilder: FormBuilder,
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["jobId"];
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    public addTask() {
        const createRef = this.sidebarManager.open("add-basic-task", TaskCreateBasicDialogComponent);
        createRef.component.jobId = this.jobId;
    }
}
