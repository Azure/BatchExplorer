import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, ServerError } from "app/models";
import { BlobListParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Constants } from "app/utils";
import { Property } from "app/utils/filter-builder";

@Component({
    selector: "bl-persisted-file-list",
    templateUrl: "persisted-file-list.html",
})
export class PersistedFileListComponent implements OnInit, OnChanges, OnDestroy {
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
    public hasAuto: boolean = false;

    private _subscriber: Subscription;

    constructor(private storageService: StorageService) {
        console.log("constructor");
        this.data = this.storageService.listBlobsForTask(null, null, null, (error: ServerError) => {
            if (error && error.body.code === Constants.APIErrorCodes.containerNotFound) {
                this.containerNotFound = true;
            }

            return false;
        });

        this.data.status.subscribe((status) => {
            this.status.next(status);
        });

        this._subscriber = storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            console.log("hasAutoStorage.subscribe :: ", hasAutoStorage);
            this.hasAuto = hasAutoStorage;
            if (!hasAutoStorage) {
                this.status.next(LoadingStatus.Ready);
            }
        });
    }

    public ngOnInit() {
        console.log("ngOnInit");
        return;
    }

    public ngOnChanges(inputs) {
        console.log("ngOnChanges, ", inputs);
        if (inputs.jobId || inputs.taskId || inputs.filter) {
            this.refresh();
        }
    }

    public ngOnDestroy() {
        console.log("ngOnDestroy: ", this.outputKind);
        this._subscriber.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        console.log("refresh");
        if (this.jobId && this.taskId && this.outputKind) {
            this._loadFiles();
        }

        return Observable.of(true);
    }

    @autobind()
    public loadMore(): Observable<any> {
        if (this.data && this.hasAuto) {
            console.log("loadMore");
            return this.data.fetchNext();
        }

        return new Observable(null);
    }

    public get baseUrl() {
        return ["/jobs", this.jobId, "tasks", this.taskId, this.outputKind];
    }

    public get filterPlaceholder() {
        return "Filter by blob name (case sensitive)";
    }

    // public get hasAutoStorage(): Observable<boolean> {
    //     return this.storageService.hasAutoStorage;
    // }

    private _loadFiles() {
        this.containerNotFound = false;
        console.log("_loadFiles(): before bool check: ", this.hasAuto);

        if (this.hasAuto) {
            this.data.updateParams({ jobId: this.jobId, taskId: this.taskId, outputKind: this.outputKind });
            this.data.setOptions(this._buildOptions());
            this.data.fetchNext(true);
        }
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
