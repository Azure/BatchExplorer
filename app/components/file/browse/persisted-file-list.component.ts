import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, Node, Task } from "app/models";
import { FileService, NodeService, TaskFileListParams, TaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-persisted-file-list",
    templateUrl: "file-list.html",
})
export class TaskFileListComponent implements OnInit, OnChanges {
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public filter: Filter;

    @ViewChild(TaskFileListComponent)
    public list: TaskFileListComponent;

    public data: RxListProxy<TaskFileListParams, File>;
    public status = new BehaviorSubject(LoadingStatus.Loading);
    public LoadingStatus = LoadingStatus;
    public nodeNotFound: boolean;

    constructor(
        private fileService: FileService,
        private nodeService: NodeService,
        private taskService: TaskService) {
        this.nodeNotFound = false;

        this.data = this.fileService.listFromTask(null, null, true, {});
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
            this._loadIfNodeExists();
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

    private _loadIfNodeExists() {
        this.status.next(LoadingStatus.Loading);
        this.taskService.getOnce(this.jobId, this.taskId).cascade((task: Task) => {
            if (!task.nodeInfo) {
                this.nodeNotFound = false;
                return null;
            }

            this.nodeService.getOnce(task.nodeInfo.poolId, task.nodeInfo.nodeId, {}).subscribe({
                next: (node: Node) => {
                    this.nodeNotFound = false;

                    if (validStates.includes(node.state)) {
                        this._loadFiles();
                    }
                },
                error: (error) => {
                    this.nodeNotFound = true;
                    this.status.next(LoadingStatus.Error);
                },
            });
        });
    }

    private _loadFiles() {
        this.data.updateParams({ jobId: this.jobId, taskId: this.taskId });
        this.data.setOptions(this._buildOptions());
        this.data.fetchNext(true);
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
