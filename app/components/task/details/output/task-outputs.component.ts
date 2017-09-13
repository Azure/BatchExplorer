import { Component, Input, OnChanges } from "@angular/core";
import { FileNavigatorEntry } from "app/components/file/browse/file-explorer";
import { ServerError } from "app/models";
import { FileService, StorageService } from "app/services";
import { FileLoader } from "app/services/file";
import { Constants, StorageUtils } from "app/utils";
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

    @Input() public taskId: string;

    public OutputType = OutputType;
    public outputTabs = outputTabs;
    public selectedTab: OutputType = OutputType.node;

    public pickedFileLoader: FileLoader = null;
    public fileNavigators: FileNavigatorEntry[] = [];

    private _taskOutputContainer: string;

    constructor(private fileService: FileService, private storageService: StorageService) { }

    public ngOnChanges(inputs) {
        this._clearFileNavigator();
        if (inputs.jobId || inputs.taskId) {
            this._updateNavigator();
        }
    }

    public selectOutputType(type: OutputType) {
        this.selectedTab = type;
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromTask(this.jobId, this.taskId, filename);
    }

    private _updateNavigator() {
        StorageUtils.getSafeContainerName(this.jobId).then((container) => {
            this._taskOutputContainer = container;
            this._clearFileNavigator();
            const nodeNavigator = this.fileService.navigateTaskFile(this.jobId, this.taskId, {
                onError: (error) => this._processTaskFilesError(error),
            });
            nodeNavigator.init();

            const taskOutputPrefix = `${this.taskId}/$TaskOutput/`;
            const taskOutputNavigator = this.storageService.navigateContainerBlobs(container, taskOutputPrefix, {
                onError: (error) => this._processBlobError(error),
            });
            taskOutputNavigator.init();

            const taskLogsPrefix = `${this.taskId}/$TaskLog/`;
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
                code: "NodeNotFound",
                message: "The node the task ran on doesn't exists anymore or is in an invalid state.",
                original: error.original,
            });
        } else if (error.status === Constants.HttpCode.Conflict) {
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
        if (error.status === Constants.HttpCode.NotFound && error.code === "ContainerNotFound") {
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
    }

    private _fileConventionErrorMessage() {
        return `There is no uploaded outputs\n`
            + `There is no blob container with the name '${this._taskOutputContainer}'\n`
            + `Learn more here https://docs.microsoft.com/en-us/azure/batch/batch-task-output-file-conventions`;
    }
}
