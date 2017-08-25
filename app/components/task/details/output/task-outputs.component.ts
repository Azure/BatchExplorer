import { Component, Input, OnChanges, ViewChild, forwardRef } from "@angular/core";
import { TaskFileListComponent } from "app/components/file/browse";
import { FileService } from "app/services";
import { FileLoader, FileNavigator } from "app/services/file";
import "./task-outputs.scss";

const outputTabs = [
    { key: "node", label: "Files on node" },
    { key: "outputs", label: "Saved output files" },
    { key: "logs", label: "Saved logs" },
];

@Component({
    selector: "bl-task-outputs",
    templateUrl: "task-outputs.html",
})
export class TaskOutputsComponent implements OnChanges {
    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    public outputTabs = outputTabs;
    public selectedTab: "node" | "outputs" | "logs" = "node";

    // tslint:disable-next-line:no-forward-ref
    @ViewChild(forwardRef(() => TaskFileListComponent))
    public nodeList: TaskFileListComponent;

    public pickedFileLoader: FileLoader = null;
    public fileNavigator: FileNavigator;

    constructor(private fileService: FileService) { }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId) {
            this._clearFileNavigator();
            this.fileNavigator = this.fileService.navigateTaskFile(this.jobId, this.taskId);
            this.fileNavigator.init();
        }
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromTask(this.jobId, this.taskId, filename);
    }

    private _clearFileNavigator() {
        if (this.fileNavigator) {
            this.fileNavigator.dispose();
        }
    }
}
