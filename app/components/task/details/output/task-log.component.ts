import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { File, ServerError, Task, TaskState } from "app/models";
import { FileService } from "app/services";
import { PollObservable } from "app/services/core";
import { FileLoader } from "app/services/file";
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

    @ViewChild("addfileInput")
    public addfileInput: ElementRef;

    public outputFileNames = defaultOutputFileNames.slice();
    public selectedOutputFile: "stdout.txt" | "stderr.txt" = defaultOutputFileNames[0] as any;
    public fileSizes: { [filename: string]: string } = {};
    public filterControl = new FormControl();
    public filteredOptions: Observable<string[]>;
    public addingFile = false;
    public fileLoaderMap: StringMap<FileLoader> = {};

    private _taskFileSubscription: Subscription;
    private _initialQueryOptions = { maxItems: 500 };
    private _options: BehaviorSubject<string[]>;
    private _currentTaskId: string = null;
    private _poller: PollObservable;
    private _refreshInterval: number = 5000;
    private _fileMap = {};

    constructor(private fileService: FileService) {
        this._options = new BehaviorSubject<string[]>([]);
        this.filteredOptions = this._options.asObservable();
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
             * so this should cut down on chatter.
             */
            if (this.task && this._currentTaskId !== this.task.id) {
                this._currentTaskId = this.task.id;
                this.fileSizes = {};
                this.addingFile = false;

                this._loadTaskFilesData();
                this._updateFileData();
            }
        }
    }

    /**
     * Navigating away from the job and task so reset the tabs
     */
    public ngOnDestroy() {
        this.resetTabs();
        this._clearTaskFilesSubscription();
        this._clearFileSizeProxyMap();
        if (this._poller) {
            this._poller.destroy();
        }
    }

    /**
     * Enable/disable the filter control
     */
    public toggleFilter() {
        this.addingFile = !this.addingFile;
        this.filterControl.setValue(null);
        if (this.addingFile) {
            setTimeout(() => {
                this.addfileInput.nativeElement.focus();
            });
        }
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

    public resetTabs() {
        this.addingFile = false;
        this.outputFileNames = defaultOutputFileNames.slice();
        this.selectedOutputFile = defaultOutputFileNames[0] as any;
    }

    /**
     * Get the task files from the node so we can use them to populate
     * the autocomplete control.
     */
    private _loadTaskFilesData() {
        this._clearTaskFilesSubscription();
        const taskFileData = this.fileService.listFromTask(
            this.jobId,
            this.task.id,
            true,
            this._initialQueryOptions,
            (error: ServerError) => {
                // todo: should i ignore all errors for this call?
                return false;
            },
        );

        // poll for files if the job has not completed
        if (this.task.state !== TaskState.completed) {
            this._poller = taskFileData.startPoll(this._refreshInterval);
        }

        this._taskFileSubscription = taskFileData.items.subscribe((items) => {
            items.map((file: File) => {
                if (this._canAddFileToMap(file)) {
                    this._fileMap[file.name] = {};
                }
            });

            this._options.next(Object.keys(this._fileMap));
        });

        taskFileData.fetchNext(true);
    }

    /**
     * Get the sizes for the output file name collection
     */
    private _updateFileData() {
        this._clearFileSizeProxyMap();
        for (const filename of this.outputFileNames) {
            const fileLoader = this.fileService.fileFromTask(this.jobId, this.task.id, filename);
            this.fileLoaderMap[filename] = fileLoader;

            if (this._shouldGetFileSize(filename)) {
                fileLoader.getProperties().subscribe((file: File) => {
                    if (file) {
                        const props = file.properties;
                        this.fileSizes[filename] = prettyBytes(props && props.contentLength);
                    }
                });
            }
        }
    }

    /**
     * Only get the size of this file if either the task hasn't completed, or
     * we don't have the current file size for the file.
     */
    private _shouldGetFileSize(filename: string) {
        return this.task.state !== TaskState.completed || !this.fileSizes[filename];
    }

    /**
     * Ignore directories and any file that is either already in the map, or
     * is one of the defaults.
     */
    private _canAddFileToMap(file: File) {
        return !file.isDirectory &&
            !(file.name in this._fileMap) &&
            file.name !== defaultOutputFileNames[0] &&
            file.name !== defaultOutputFileNames[1];
    }

    private _clearFileSizeProxyMap() {
        this.fileLoaderMap = {};
    }

    private _clearTaskFilesSubscription() {
        this._fileMap = {};
        if (this._taskFileSubscription) {
            this._taskFileSubscription.unsubscribe();
        }
    }
}
