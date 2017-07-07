import { Component, Input, OnChanges, OnDestroy, SimpleChange, ViewChild } from "@angular/core";
import { LoadingStatus } from "app/components/base/loading";
import { TreeViewDisplayComponent, buildTreeRootFilter } from "app/components/file/browse/tree-view";
import { File, Node, NodeState, ServerError, Task } from "app/models";
import { FileService, NodeService, TaskFileListParams, TaskService, TreeComponentService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Constants } from "app/utils";
import { Filter, Property } from "app/utils/filter-builder";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

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
    public jobId: string; // remove later

    @Input()
    public taskId: string;

    @Input()
    public filter: Filter;

    @ViewChild(TreeViewDisplayComponent)
    public treeDisplay: TreeViewDisplayComponent;
    public moreFileMap: StringMap<boolean> = {};
    public LoadingStatus = LoadingStatus;
    public fileCleanupOperation: boolean;
    public nodeNotFound: boolean;
    public nodeInInvalidState: boolean;
    public nodeState: string;

    public status = new BehaviorSubject(LoadingStatus.Loading);
    public error: BehaviorSubject<ServerError> = new BehaviorSubject(null);

    private _fileProxyMap: StringMap<RxListProxy<TaskFileListParams, File>> = {};

    constructor(
        private treeComponentService: TreeComponentService,
        private fileService: FileService,
        private nodeService: NodeService,
        private taskService: TaskService) { }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId || inputs.filter) {
            this._initProxyMap(inputs);
            this.refresh();
        }
    }

    public ngOnDestroy(): void {
        this.status.unsubscribe();
        this.error.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.jobId && this.taskId) {
            this._loadIfNodeExists();
        }
        return Observable.of(true);
    }

    public get baseUrl() {
        return ["/jobs", this.jobId, "tasks", this.taskId];
    }

    public get filterPlaceholder() {
        return "Filter by file name";
    }

    @autobind()
    public loadPath(path: string, refresh: boolean = false): Observable<List<File>> {
        if (!(path in this._fileProxyMap)) {
            const options = buildTreeRootFilter(path);
            const jobId = this.jobId;
            const taskId = this.taskId;
            this._fileProxyMap[path] = this.fileService.listFromTask(jobId, taskId, false, options);
            this._fileProxyMap[path].hasMore.subscribe((hasMore) => {
                this.moreFileMap[path] = hasMore;
            });
            this._fileProxyMap[path].status.subscribe((status) => {
                this.status.next(status);
            });
            this._fileProxyMap[path].error.subscribe((error) => {
                if (error && error.body.code === Constants.APIErrorCodes.operationInvalidForCurrentState) {
                    this.fileCleanupOperation = true;
                    return;
                }
                this.error.next(error);
            });
        }
        let observable = refresh ?  this._fileProxyMap[path].refresh() : this._fileProxyMap[path].fetchNext();
        return observable.flatMap(() => {
            return this._fileProxyMap[path].items.first();
        });
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
                        const filterProp = this.filter as Property;
                        const loadPath = filterProp && filterProp.value;
                        this.treeDisplay.initNodes(loadPath, true);
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

    private _initProxyMap(inputs) {
        let jobIdInput: SimpleChange = inputs.jobId;
        let taskIdInput: SimpleChange = inputs.taskId;
        if (this._hasInputChanged(jobIdInput) || this._hasInputChanged(taskIdInput)) {
            this.treeComponentService.treeNodes = [];
            this._disposeListProxy();
            this._fileProxyMap = {} as StringMap<RxListProxy<TaskFileListParams, File>>;
            this.moreFileMap = {} as StringMap<boolean>;
        }
    }

    private _resetStates() {
        this.nodeState = null;
        this.nodeInInvalidState = false;
        this.fileCleanupOperation = false;
        this.nodeNotFound = false;
    }

    private _disposeListProxy() {
        for (let path in this._fileProxyMap){
            if (path !== null) {
                this._fileProxyMap[path].dispose();
            }
        }
    }

    private _hasInputChanged(input: SimpleChange): boolean {
        return input && input.previousValue && input.currentValue !== input.previousValue;
    }
}
