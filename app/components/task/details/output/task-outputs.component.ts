import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { HttpCode } from "@batch-flask/core";
import {
    FileExplorerConfig, FileExplorerWorkspace, FileNavigatorEntry,
} from "app/components/file/browse/file-explorer";
import { ServerError, Task, TaskState } from "app/models";
import { FileService, StorageService } from "app/services";
import { FileLoader } from "app/services/file";
import { ComponentUtils, StorageUtils } from "app/utils";
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
export class TaskOutputsComponent implements OnChanges, OnDestroy {
    @Input() public jobId: string;

    @Input() public task: Task;

    public OutputType = OutputType;
    public outputTabs = outputTabs;
    public selectedTab: OutputType = OutputType.node;

    public pickedFileLoader: FileLoader = null;
    public fileNavigators: FileNavigatorEntry[] = [];
    public isTaskQueued = false;
    public stateTooltip: string;
    public workspace: FileExplorerWorkspace;
    public fileExplorerConfig: FileExplorerConfig = {};

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
            this._updateFileExplorerConfig();
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

    public ngOnDestroy() {
        this._disposeWorkspace();
    }

    public selectOutputType(type: OutputType) {
        this.selectedTab = type;
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromTask(this.jobId, this.task.id, filename);
    }

    private _updateFileExplorerConfig() {
        this.fileExplorerConfig = {
            tailable: this.task.state === TaskState.running,
        };
    }
    private _updateNavigator() {
        this._disposeWorkspace();
        if (this.isTaskQueued) {
            return;
        }
        StorageUtils.getSafeContainerName(this.jobId).then((container) => {
            this._clearFileNavigator();
            const nodeNavigator = this.fileService.navigateTaskFile(this.jobId, this.task.id, {
                onError: (error) => this._processTaskFilesError(error),
            });
            nodeNavigator.init();

            const taskOutputPrefix = `${this.task.id}`;
            const taskOutputNavigator = this.storageService.navigateContainerBlobs(container, taskOutputPrefix, {
                onError: (error) => this._processBlobError(error),
            });
            taskOutputNavigator.init();

            this.workspace = new FileExplorerWorkspace([
                {
                    name: "Node files",
                    navigator: nodeNavigator,
                    openedFiles: ["stdout.txt", "stderr.txt"],
                },
                { name: "Persisted output", navigator: taskOutputNavigator },
            ]);
        });
    }

    private _processTaskFilesError(error: ServerError): ServerError {
        if (error.status === HttpCode.NotFound) {
            return new ServerError({
                status: 404,
                code: "NodeNotFound",
                message: "The node the task ran on doesn't exist anymore or is in an invalid state.",
                original: error.original,
            });
        } else if (error.status === HttpCode.Conflict) {
            return new ServerError({
                status: 404,
                code: "TaskFilesDeleted",
                message: "The task files were cleaned from the node.",
                original: error.original,
            });
        }
        return error;
    }

    private _processBlobError(error: ServerError): ServerError {
        if (error.status === HttpCode.NotFound && error.code === "ContainerNotFound") {
            return new ServerError({
                status: 404,
                code: "NoPersistedOutput",
                message: this._fileConventionErrorMessage(),
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
        return `There are no file conventions library outputs for this job. Learn more here: `
            + `https://go.microsoft.com/fwlink/?linkid=860744\n\n`
            + `If the job was created from a job template, outputs can be viewed by going to the 'Data' menu `
            + `and selecting the output file group.`;
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

    private _disposeWorkspace() {
        if (this.workspace) {
            this.workspace.dispose();
            this.workspace = null;
        }
    }
}
