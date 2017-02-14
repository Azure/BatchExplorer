import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { File, Task } from "app/models";
import { FileService } from "app/services";
import { prettyBytes } from "app/utils";

const outputFileNames = ["stdout.txt", "stderr.txt"];

@Component({
    selector: "bex-task-output",
    templateUrl: "task-output.html",
})
export class TaskOutputComponent implements OnChanges, OnDestroy {
    public outputFileNames = outputFileNames;
    @Input()
    public jobId: string;

    @Input()
    public task: Task;

    public outputFilename: "stdout.txt" | "stderr.txt" = "stdout.txt";

    public fileSizes: { [filename: string]: string } = {};

    private _dataSubs: Subscription[] = [];
    constructor(private fileService: FileService) {

    }
    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.task) {
            this._updateFileData();
        }
    }

    public ngOnDestroy() {
        this._clearSubscriptions();
    }

    private _updateFileData() {
        this._clearSubscriptions();
        outputFileNames.map((filename) => {
            const data = this.fileService.getFilePropertiesFromTask(this.jobId, this.task.id, filename);
            this._dataSubs.push(data.item.subscribe((file: File) => {
                console.log("Got file", file);
                if (file) {
                    const props = file.properties;
                    console.log("got content filename", props && props.contentLength);
                    this.fileSizes[filename] = prettyBytes(props && props.contentLength);
                }
            }));
            data.fetch();
        });
    }

    private _clearSubscriptions() {
        this._dataSubs.forEach(x => x.unsubscribe());
    }
}
