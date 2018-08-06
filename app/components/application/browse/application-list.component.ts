import { ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { Router } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { BatchApplication } from "app/models";
import { ApplicationListParams, ApplicationService } from "app/services";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { BatchApplicationCommands } from "../action";

import "./application-list.scss";

@Component({
    selector: "bl-application-list",
    templateUrl: "application-list.html",
    providers: [BatchApplicationCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => ApplicationListComponent),
    }],
})
export class ApplicationListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    public data: ListView<BatchApplication, ApplicationListParams>;
    public applications: List<BatchApplication>;
    public displayedApplications: List<BatchApplication>;

    private _baseOptions = { maxresults: 50 };
    private _subs: Subscription[] = [];

    constructor(
        router: Router,
        changeDetector: ChangeDetectorRef,
        public commands: BatchApplicationCommands,
        private applicationService: ApplicationService,
    ) {
        super(changeDetector);

        this.data = this.applicationService.listView(this._baseOptions);
        this._subs.push(this.data.items.subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        }));

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._subs.push(applicationService.onApplicationAdded.subscribe((applicationId) => {
            this.data.loadNewItem(applicationService.get(applicationId));
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        this._filterApplications();
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

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public trackByFn(index, application: BatchApplication) {
        return application.id;
    }

    private _filterApplications() {
        let text: string = null;
        if (this.filter && this.filter.properties.length > 0) {
            text = (this.filter.properties[0] as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedApplications = List<BatchApplication>(this.applications.filter((app) => {
            return !text || app.id.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
