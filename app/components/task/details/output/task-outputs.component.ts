import { Component, Input, OnChanges } from "@angular/core";
import { FileNavigatorEntry } from "app/components/file/browse/file-explorer";
import { ServerError, Task, TaskState } from "app/models";
import { FileService, StorageService } from "app/services";
import { FileLoader } from "app/services/file";
import { ComponentUtils, Constants, StorageUtils } from "app/utils";
import "./task-outputs.scss";

enum OutputType {
    node,
    output,
    logs,
}

const outputTabs = [
    { key: OutputType.node, label: "Files on node" },
    { key: OutputType.output, label: "Saved output files" },
    { key: OutputType.logs, label: "Saved logs" },
];
@Component({
    selector: "bl-task-outputs",
    templateUrl: "task-outputs.html",
})
export class TaskOutputsComponent implements OnChanges {
    @Input() public jobId: string;

    @Input() public task: Task;

    public OutputType = OutputType;
    public outputTabs = outputTabs;
    public selectedTab: OutputType = OutputType.node;

    public pickedFileLoader: FileLoader = null;
    public fileNavigators: FileNavigatorEntry[] = [];
    public isTaskQueued = false;
    public stateTooltip: string;

    private _taskOutputContainer: string;

    constructor(private fileService: FileService, private storageService: StorageService) { }

    public ngOnChanges(changes) {
        let updateNavigator = false;
        if (changes.task) {
            const isTaskQueued = this.task.state === TaskState.active || this.task.state === TaskState.preparing;
            if (isTaskQueued !== this.isTaskQueued) {
                updateNavigator = true;
            }
            this.isTaskQueued = isTaskQueued;
            this._updateStateTooltip();
        }
        if (changes.jobId || ComponentUtils.recordChangedId(changes.task)) {
            if (!this.isTaskQueued) {
                updateNavigator = true;
            }
        }
        if (updateNavigator) {
            this._updateNavigator();
        }
    }

    public selectOutputType(type: OutputType) {
        this.selectedTab = type;
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromTask(this.jobId, this.task.id, filename);
    }

    private _updateNavigator() {
        StorageUtils.getSafeContainerName(this.jobId).then((container) => {
            this._taskOutputContainer = container;
            this._clearFileNavigator();
            const nodeNavigator = this.fileService.navigateTaskFile(this.jobId, this.task.id, {
                onError: (error) => this._processTaskFilesError(error),
            });
            nodeNavigator.openFiles(["stdout.txt", "stderr.txt", "wd/example-jobs/python/pi.py"]);
            nodeNavigator.init();

            const taskOutputPrefix = `${this.task.id}/$TaskOutput/`;
            const taskOutputNavigator = this.storageService.navigateContainerBlobs(container, taskOutputPrefix, {
                onError: (error) => this._processBlobError(error),
            });
            taskOutputNavigator.init();

            const taskLogsPrefix = `${this.task.id}/$TaskLog/`;
            const taskLogsNavigator = this.storageService.navigateContainerBlobs(container, taskLogsPrefix, {
                onError: (error) => this._processBlobError(error),
            });
            taskLogsNavigator.init();

            this.fileNavigators = [
                { name: "Node files", navigator: nodeNavigator },
                { name: "Persisted output", navigator: taskOutputNavigator },
                { name: "Persisted logs", navigator: taskLogsNavigator },
            ];
        });
    }

    private _processTaskFilesError(error: ServerError): ServerError {
        if (error.status === Constants.HttpCode.NotFound) {
            return new ServerError({
                status: 404,
                body: {
                    code: "NodeNotFound",
                    message: "The node the task ran on doesn't exists anymore or is in an invalid state.",
                },
                original: error.original,
            });
        } else if (error.status === Constants.HttpCode.Conflict) {
            return new ServerError({
                status: 404,
                body: {
                    code: "TaskFilesDeleted",
                    message: "The task files were cleaned from the node.",
                },
                original: error.original,
            });
        }
        return error;
    }

    private _processBlobError(error: ServerError): ServerError {
        if (error.status === Constants.HttpCode.NotFound && error.body.code === "ContainerNotFound") {
            return new ServerError({
                status: 404,
                body: {
                    code: "NoPersistedOutput",
                    message: this._fileConventionErrorMessage(),
                },
                original: error.original,
            });
        }
        return error;
    }

    private _clearFileNavigator() {
        this.fileNavigators.forEach(x => x.navigator.dispose());
        this.fileNavigators = [];
    }

    private _fileConventionErrorMessage() {
        return `There is no uploaded outputs\n`
            + `There is no blob container with the name '${this._taskOutputContainer}'\n`
            + `Learn more here https://docs.microsoft.com/en-us/azure/batch/batch-task-output-file-conventions`;
    }

    private _updateStateTooltip() {
        switch (this.task.state) {
            case TaskState.active:
                this.stateTooltip = "Task is queued and is waiting to be scheduled by Azure Batch";
                break;
            case TaskState.preparing:
                this.stateTooltip = "Task has been scheduled to run and "
                    + "is waiting for the job preparation task to complete";
                break;
            default:
                this.stateTooltip = null;
        }
    }
}
