import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { DeleteApplicationAction } from "../action";

@Component({
    selector: "bl-application-list",
    templateUrl: "application-list.html",
})
export class ApplicationListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<{}, BatchApplication>;
    public applications: List<BatchApplication>;
    public displayedApplications: List<BatchApplication>;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._filterApplications();
    }
    public get filter(): Filter { return this._filter; }

    private _baseOptions = { maxresults: 50 };
    private _subs: Subscription[] = [];
    private _filter: Filter;

    constructor(
        router: Router,
        private applicationService: ApplicationService,
        private taskManager: BackgroundTaskService) {

        super();

        this.data = this.applicationService.list(this._baseOptions);
        this._subs.push(this.data.items.subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        }));

        this.status = this.data.status;
        this._subs.push(applicationService.onApplicationAdded.subscribe((applicationId) => {
            this.data.loadNewItem(applicationService.getOnce(applicationId));
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public appStatus(application: BatchApplication): QuickListItemStatus {
        return application.allowUpdates
            ? QuickListItemStatus.lightaccent
            : QuickListItemStatus.accent;
    }

    public appStatusText(application: BatchApplication): string {
        return application.allowUpdates
            ? "Application allows updates"
            : "Application is locked";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteApplicationAction(this.applicationService, this.selectedItems);
            task.start(backgroundTask);

            return task.waitingDone;
        });
    }

    private _filterApplications() {
        let text: string = null;
        if (this._filter && this._filter.properties.length > 0) {
            text = (this._filter.properties[0] as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedApplications = List<BatchApplication>(this.applications.filter((app) => {
            return !text || app.id.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
