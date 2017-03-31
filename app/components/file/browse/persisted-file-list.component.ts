import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, ServerError } from "app/models";
import { BlobListParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Property } from "app/utils/filter-builder";

@Component({
    selector: "bl-persisted-file-list",
    templateUrl: "persisted-file-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersistedFileListComponent implements OnInit, OnChanges {
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public outputKind: string;

    @Input()
    public filter: Property;

    public data: RxListProxy<BlobListParams, File>;
    public status = new BehaviorSubject(LoadingStatus.Loading);
    public LoadingStatus = LoadingStatus;
    public containerNotFound: boolean;

    constructor(private storageService: StorageService) {
        this.data = this.storageService.listBlobsForTask(null, null, null, (error: ServerError) => {
            if (error && error.body.code === "ContainerNotFound") {
                this.containerNotFound = true;
            }

            return false;
        });

        this.data.status.subscribe((status) => {
            this.status.next(status);
        });
    }

    public ngOnInit() {
        return;
    }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId || inputs.filter) {
            this.refresh();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.jobId && this.taskId) {
            this._loadFiles();
        }

        return Observable.of(true);
    }

    @autobind()
    public loadMore(): Observable<any> {
        if (this.data) {
            return this.data.fetchNext();
        }

        return new Observable(null);
    }

    // TODO: this is wrong now
    public get baseUrl() {
        return ["/jobs", this.jobId, "tasks", this.taskId];
    }

    public get filterPlaceholder() {
        return "Filter by blob name (case sensitive)";
    }

    private _loadFiles() {
        this.containerNotFound = false;
        this.data.updateParams({ jobId: this.jobId, taskId: this.taskId, outputKind: this.outputKind });
        this.data.setOptions(this._buildOptions());
        this.data.fetchNext(true);
    }

    private _buildOptions() {
        if (this.filter && this.filter.value) {
            return {
                filter: this.filter.value,
            };
        } else {
            return {};
        }
    }
}
