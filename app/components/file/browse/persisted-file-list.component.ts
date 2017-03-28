import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, Node, Task } from "app/models";
import { FileService, StorageService, TaskFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-persisted-file-list",
    templateUrl: "persisted-file-list.html",
})
export class PersistedFileListComponent implements OnInit, OnChanges {
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public filter: Filter;

    @ViewChild(PersistedFileListComponent)
    public blobList: PersistedFileListComponent;

    public data: RxListProxy<TaskFileListParams, File>;
    public status = new BehaviorSubject(LoadingStatus.Loading);
    public LoadingStatus = LoadingStatus;
    public noBlobsFound = false;

    constructor(
        private fileService: FileService,
        private storageService: StorageService) {

        this.data = this.storageService.listBlobsForTask(null, null);
        // this.data.status.subscribe((status) => {
        //     this.status.next(status);
        // });
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

    public get baseUrl() {
        return ["/jobs", this.jobId, "tasks", this.taskId];
    }

    private _loadFiles() {
        this.noBlobsFound = true;
        // this.data.updateParams({ jobId: this.jobId, taskId: this.taskId });
        // this.data.setOptions(this._buildOptions());
        // this.data.fetchNext(true);
    }

    private _buildOptions() {
        if (this.filter && !this.filter.isEmpty()) {
            return {
                filter: this.filter.toOData(),
            };
        } else {
            return {};
        }
    }
}
