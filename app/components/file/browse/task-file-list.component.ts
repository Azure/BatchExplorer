import { Component, Input, OnChanges, SimpleChange, ViewChild } from "@angular/core";
import { LoadingStatus } from "app/components/base/loading";
import { TreeViewDisplayComponent } from "app/components/file/browse/display";
import { File, Node, NodeState, ServerError, Task } from "app/models";
import { FileService, NodeService, TaskFileListParams, TaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Constants } from "app/utils";
import { Filter, FilterBuilder, Property } from "app/utils/filter-builder";
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
];

@Component({
    selector: "bl-task-file-list",
    templateUrl: "file-list.html",
})
export class TaskFileListComponent implements OnChanges {
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

    public LoadingStatus = LoadingStatus;
    public fileCleanupOperation: boolean;
    public nodeNotFound: boolean;

    public status = new BehaviorSubject(LoadingStatus.Loading);
    public error: BehaviorSubject<ServerError> = new BehaviorSubject(null);

    private _fileProxyMap: StringMap<RxListProxy<TaskFileListParams, File>> = {};

    constructor(
        private fileService: FileService,
        private nodeService: NodeService,
        private taskService: TaskService) { }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId || inputs.filter) {
            this._initProxyMap(inputs);
            this.refresh();
        }
    }

    public refresh() {
        if (this.jobId && this.taskId) {
            this._loadIfNodeExists();
        }
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
            const filterPath = path ? { filter: FilterBuilder.prop("name").startswith(path).toOData() } : {};
            const jobId = this.jobId;
            const taskId = this.taskId;
            this._fileProxyMap[path] = this.fileService.listFromTask(jobId, taskId, false, filterPath);
        }
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
        let observable = refresh ?  this._fileProxyMap[path].refresh() : this._fileProxyMap[path].fetchNext();
        return observable.flatMap(() => {
            return this._fileProxyMap[path].items.first();
        });
    }

    private _loadIfNodeExists() {
        this.fileCleanupOperation = false;
        this.nodeNotFound = false;
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
                        const filterProp = this.filter as Property;
                        const loadPath = filterProp && filterProp.value;
                        this.treeDisplay.initNodes(loadPath, true);
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
        if (jobIdInput && jobIdInput.previousValue && jobIdInput.currentValue !== jobIdInput.previousValue ||
            taskIdInput && taskIdInput.previousValue && taskIdInput.currentValue !== taskIdInput.previousValue) {
            this._fileProxyMap = {} as StringMap<RxListProxy<TaskFileListParams, File>>;
        }
    }
}
