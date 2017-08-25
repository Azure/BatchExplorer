import { Component, Input, OnChanges } from "@angular/core";
import { FileService, StorageService } from "app/services";
import { FileLoader, FileNavigator } from "app/services/file";
import { StorageUtils } from "app/utils";
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
    public selectedTab: OutputType = OutputType.output;

    public pickedFileLoader: FileLoader = null;
    public fileNavigator: FileNavigator;

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
        this._clearFileNavigator();
        switch (this.selectedTab) {
            case OutputType.node:
                this.fileNavigator = this.fileService.navigateTaskFile(this.jobId, this.taskId);
                this.fileNavigator.init();
                break;
            case OutputType.output:
            case OutputType.logs:
                const prefix = `${this.taskId}/`;
                StorageUtils.getSafeContainerName(this.jobId).then((container) => {
                    this.fileNavigator = this.storageService.navigateContainerBlobs(container, { prefix: prefix });
                    this.fileNavigator.init();
                });
                break;
        }
    }
    private _clearFileNavigator() {
        if (this.fileNavigator) {
            this.fileNavigator.dispose();
        }
    }
}
