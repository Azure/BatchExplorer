import { Component, Input, OnChanges, ViewChild, forwardRef } from "@angular/core";
import { TaskFileListComponent } from "app/components/file/browse";
import { FileDetailsQuickviewComponent, IfileDetails } from "app/components/file/details";
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

    public options: IfileDetails;

    @ViewChild(FileDetailsQuickviewComponent)
    public quickview: FileDetailsQuickviewComponent;

    // tslint:disable-next-line:no-forward-ref
    @ViewChild(forwardRef(() => TaskFileListComponent))
    public nodeList: TaskFileListComponent;

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.taskId) {
            this.options = {
                sourceType: "job",
                taskId: this.taskId,
                jobId: this.jobId,
            } as IfileDetails;
        }
    }

    public updateOptions(event) {
        this.quickview.filename = event;
        this.quickview.initFileLoader();
    }
}
