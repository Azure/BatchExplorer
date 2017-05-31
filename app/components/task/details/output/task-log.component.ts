import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { File, ServerError, Task, TaskState } from "app/models";
import { FileService } from "app/services";
import { prettyBytes } from "app/utils";

const defaultOutputFileNames = ["stdout.txt", "stderr.txt"];

@Component({
    selector: "bl-task-log",
    templateUrl: "task-log.html",
})
export class TaskLogComponent implements OnInit, OnChanges, OnDestroy {
    @Input()
    public jobId: string;

    @Input()
    public task: Task;

    public outputFileNames = defaultOutputFileNames.slice();
    public selectedOutputFile: "stdout.txt" | "stderr.txt" = defaultOutputFileNames[0] as any;
    public fileSizes: { [filename: string]: string } = {};
    public filterControl = new FormControl();
    public filteredOptions: Observable<string[]>;
    public addingFile = false;

    private _dataSubs: Subscription[] = [];
    private _taskFileSubscription: Subscription;
    private _options: BehaviorSubject<string[]>;
    private _currentTaskId: string = null;

    constructor(private fileService: FileService) {
        this._options = new BehaviorSubject<string[]>([]);

        // todo: read these from the node
        // todo: future enhancement, read from storage as well
        // https://material.angular.io/components/component/autocomplete
        this._options.next([
            "stdout.txt",
            "stderr.txt",
            "ProcessEnv.cmd",
            "bob.cmd",
        ]);
        this.filteredOptions = this._options;
    }

   public ngOnInit() {
      this.filteredOptions = this.filterControl.valueChanges
         .map((nameFilter) => {
             return nameFilter
                ? this._options.value.filter(option => new RegExp(`${nameFilter}`, "gi").test(option))
                : this._options.value;
        });
   }

    public ngOnChanges(inputs) {
        if (inputs.jobId || inputs.task) {
            /**
             * ngOnChanges is fired multiple times for the same task selection
             * so this should cut down on API chatter.
             */
            if (this.task && this._currentTaskId !== this.task.id) {
                this._currentTaskId = this.task.id;
                this.fileSizes = {};
                this.addingFile = false;

                console.log("about to load files for task: ", this._currentTaskId);
                this._loadTaskFilesData();
                this._updateFileData();
            }
        }
    }

    /**
     * Navigating away from the job and task so reset the tabs
     */
    public ngOnDestroy() {
        this.addingFile = false;
        this.outputFileNames = defaultOutputFileNames.slice();
        this.selectedOutputFile = defaultOutputFileNames[0] as any;

        this._taskFileSubscription.unsubscribe();
        this._clearSubscriptions();
    }

    /**
     * Enable/disable the filter control
     */
    public toggleFilter() {
        this.addingFile = !this.addingFile;
        this.filterControl.setValue(null);
    }

    /**
     * Fires when an item is selected from the autocomplete option list
     * @param event - the selection event
     * @param item - selected item, add this to a tab if it doesn't already exist
     */
    public optionSelected($event: any, item: string) {
        if (item && !this.outputFileNames.find(existing => existing === item)) {
            this.outputFileNames.push(item);
            this.selectedOutputFile = item as any;
            this.toggleFilter();
            this._updateFileData();
        }
    }

    /**
     * Get the sizes for the output file name collection
     */
    private _loadTaskFilesData() {
        const fileData = this.fileService.listFromTask(this.jobId, this.task.id, true, {}, (error: ServerError) => {
            // todo: add something to the output list, or just ignore all errors?
            return false;
        });

        this._taskFileSubscription = fileData.items.subscribe((items) => {
            console.log("fileData.items: ", items);
            items.map((file: File) => {
                console.log(`${file.name}-${file.isDirectory}`);
            });
        });

        fileData.fetchNext(true);
    }

    /**
     * Get the sizes for the output file name collection
     */
    private _updateFileData() {
        this._clearSubscriptions();
        this.outputFileNames.map((filename) => {
            if (this._shouldGetFileSize(filename)) {
                const data = this.fileService.getFilePropertiesFromTask(this.jobId, this.task.id, filename);
                this._dataSubs.push(data.item.subscribe((file: File) => {
                    if (file) {
                        const props = file.properties;
                        this.fileSizes[filename] = prettyBytes(props && props.contentLength);
                    }
                }));

                data.fetch();
            }
        });
    }

    /**
     * Only get the size of this file if either the task hasn't completed, or
     * we don't have the current file size for the file.
     */
    private _shouldGetFileSize(filename: string) {
        return this.task.state !== TaskState.completed || !this.fileSizes[filename];
    }

    /**
     * Unsubscribe from any existing saved subscriptions
     */
    private _clearSubscriptions() {
        this._dataSubs.forEach(x => x.unsubscribe());
    }
}
