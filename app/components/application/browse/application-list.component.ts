import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { AccountResource, Application } from "app/models";
import { AccountService, ApplicationService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-application-list",
    templateUrl: "./application-list.html",
})
export class ApplicationListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<{}, Application>;
    public searchQuery = new FormControl();

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; };

    private _baseOptions = {};
    private _onJobAddedSub: Subscription;
    private _filter: Filter;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private applicationService: ApplicationService,
        private taskManager: BackgroundTaskManager) {

        super();

        this.data = this.applicationService.list(this._baseOptions);
        this.status = this.data.status;
        this._onJobAddedSub = applicationService.onApplicationAdded.subscribe((applicationId) => {
            this.data.loadNewItem(applicationService.get(applicationId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._onJobAddedSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public appStatus(application: Application): QuickListItemStatus {
        return QuickListItemStatus.normal;
    }

    public appStatusText(application: Application): string {
        return "";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    // public deleteSelected() {
    //     this.taskManager.startTask("", (backgroundTask) => {
    //         const task = new DeleteJobAction(this.jobService, this.selectedItems);
    //         task.start(backgroundTask);
    //         return task.waitingDone;
    //     });
    // }
}
