import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-task-file-list",
    templateUrl: "file-list.html",
})
export class TaskFileListComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public set jobId(value: string) {
        this._jobId = (value && value.trim());
        this.refresh();
    }
    public get jobId() { return this._jobId; }

    @Input()
    public set taskId(value: string) {
        this._taskId = (value && value.trim());
        this.refresh();
    }
    public get taskId() { return this._taskId; }

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

    @ViewChild(TaskFileListComponent)
    public list: TaskFileListComponent;

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<NodeFileListParams, File>;

    private _filter: Filter;
    private _jobId: string;
    private _taskId: string;

    constructor(private fileService: FileService) {
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.jobId && this.taskId) {
            // TODO: only do this if the node is in a state to list files (e.g. idle, running, startTaskFailed, etc...)
            this.data = this.fileService.listFromTask(this.jobId, this.taskId, true, {});
            this.status = this.data.status;
            this.data.setOptions({}); // This clears the previous list objects
            return this.data.fetchNext();
        }
    }

    @autobind()
    public loadMore(): Observable<any> {
        return this.data.fetchNext();
    }
}
