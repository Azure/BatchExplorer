import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File, Node, NodeState, ServerError, Task } from "app/models";
import { FileService, NodeService, TaskFileListParams, TaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Constants } from "app/utils";
import { Filter } from "app/utils/filter-builder";

/**
 * Valid state of a node to retrieve files
 * Other states will fail.
 */
const validStates = [
    NodeState.idle,
    NodeState.running,
    NodeState.startTaskFailed,
];

@Component({
    selector: "bl-task-file-list",
    templateUrl: "file-list.html",
})
export class TaskFileListComponent implements OnChanges, OnDestroy {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public filter: Filter;

    public data: RxListProxy<TaskFileListParams, File>;
    public status = new BehaviorSubject(LoadingStatus.Loading);
    public LoadingStatus = LoadingStatus;
    public fileCleanupOperation: boolean;
    public nodeNotFound: boolean;
    public nodeInInvalidState: boolean;
    public nodeState: string;

    private _statuSub: Subscription;

    constructor(
        private fileService: FileService,
        private nodeService: NodeService,
        private taskService: TaskService) {

        this.data = this.fileService.listFromTask(null, null, true, {}, (error: ServerError) => {
            if (error && error.body.code === Constants.APIErrorCodes.operationInvalidForCurrentState) {
                this.fileCleanupOperation = true;
                return false;
            }

            // carry on throwing error
            return true;
        });

        this._statuSub = this.data.status.subscribe((status) => {
            this.status.next(status);
        });
    }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId || inputs.filter) {
            this.refresh();
        }
    }

    public ngOnDestroy() {
        this.status.unsubscribe();
        this._statuSub.unsubscribe();
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

    public get filterPlaceholder() {
        return "Filter by file name";
    }

    private _loadIfNodeExists() {
        this._resetStates();
        this.status.next(LoadingStatus.Loading);
        this.taskService.getOnce(this.jobId, this.taskId).cascade((task: Task) => {
            if (!task.nodeInfo) {
                return null;
            }

            this.nodeService.getOnce(task.nodeInfo.poolId, task.nodeInfo.nodeId, {}).subscribe({
                next: (node: Node) => {
                    if (validStates.includes(node.state)) {
                        this._loadFiles();
                    } else {
                        this.nodeState = node.state;
                        this.status.next(LoadingStatus.Ready);
                        this.nodeInInvalidState = true;
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

    private _resetStates() {
        this.nodeState = null;
        this.nodeInInvalidState = false;
        this.fileCleanupOperation = false;
        this.nodeNotFound = false;
    }
}
