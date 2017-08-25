import { Component, Input, OnChanges } from "@angular/core";
import { FileNavigatorEntry } from "app/components/file/browse/file-explorer";
import { FileService, StorageService } from "app/services";
import { FileLoader } from "app/services/file";
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
    public selectedTab: OutputType = OutputType.node;

    public pickedFileLoader: FileLoader = null;
    public fileNavigators: FileNavigatorEntry[] = [];

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
            this._clearFileNavigator();
            const nodeNavigator = this.fileService.navigateTaskFile(this.jobId, this.taskId);
            nodeNavigator.init();

            const prefix = `${this.taskId}/`;
            const taskOutputNavigator = this.storageService.navigateContainerBlobs(container, { prefix: prefix });
            // taskOutputNavigator.init();

            // const prefix = `${this.taskId}/`;
            // const taskLogsNavigator = this.storageService.navigateContainerBlobs(container, { prefix: prefix });
            // taskLogsNavigator.init();

            this.fileNavigators = [
                { name: "Node files", navigator: nodeNavigator },
                { name: "Persisted output", navigator: nodeNavigator },
                { name: "Persisted logs", navigator: nodeNavigator },
            ];
            console.log("File navigators...", this.fileNavigators);
        });
    }
    private _clearFileNavigator() {
        this.fileNavigators.forEach(x => x.navigator.dispose());
    }
}
