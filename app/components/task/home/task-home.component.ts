import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { SidebarManager } from "../../base/sidebar";
import { TaskCreateBasicDialogComponent } from "../action";
import { Filter, FilterBuilder } from "app/utils/filter-builder";

@Component({
    selector: "bex-task-home",
    templateUrl: "./task-home.html",
})
export class TaskHomeComponent implements OnInit, OnDestroy {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();
    public jobId: string;

    private _paramsSubscriber: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {

        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }
            this._updateFilter();
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["jobId"];
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    public addTask() {
        const createRef = this.sidebarManager.open("add-basic-task", TaskCreateBasicDialogComponent);
        createRef.component.jobId = this.jobId;
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
