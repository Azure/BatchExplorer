import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { Observable } from "rxjs";

import { DialogService } from "app/components/base/dialogs";
import { FileDeleteEvent, FileDropEvent, FileExplorerConfig } from "app/components/file/browse/file-explorer";
import { File } from "app/models";
import { StorageService } from "app/services";
import { FileNavigator } from "app/services/file";
import { FileUrlUtils } from "app/utils";

@Component({
    selector: "bl-blob-files-browser",
    templateUrl: "blob-files-browser.html",
})
export class BlobFilesBrowserComponent implements OnChanges, OnDestroy {
    @Input() public container: string;
    @Input() public fileExplorerConfig: FileExplorerConfig = {};
    @Input() public activeFile: string;
    @Input() public upload: (event: FileDropEvent) => Observable<any>;
    @Input() public delete: (files: File[]) => Observable<any>;

    @Output() public activeFileChange = new EventEmitter<string>();

    public fileNavigator: FileNavigator;

    constructor(private storageService: StorageService, private dialogService: DialogService) { }

    public refresh() {
        this.fileNavigator.refresh();
    }

    public ngOnChanges(inputs) {
        this._clearFileNavigator();

        if (inputs.container || inputs.jobId) {
            this.fileNavigator = this.storageService.navigateContainerBlobs(this.container);
            this.fileNavigator.init();
        }

        if (inputs.upload) {
            this.fileExplorerConfig = {
                canDropExternalFiles: Boolean(this.upload),
                canDeleteFiles: true,
            };
        }
    }

    public ngOnDestroy() {
        this._clearFileNavigator();
    }

    public handleFileDrop(event: FileDropEvent) {
        const { path } = event;
        this.dialogService.confirm(`Upload files`, {
            description: `Files will be uploaded to /${path}`,
            yes: () => {
                this.upload(event).subscribe(() => {
                    this.fileNavigator.refresh(path);
                });

                return Observable.of(null);
            },
        });
    }

    public handleDeleteEvent(event: FileDeleteEvent) {
        const { path } = event;
        console.log("BlobFilesBrowserComponent.handleDeleteEvent: ", event);

        // TODO: Check with Tim as to whether i can chain 2 background tasks to run one after another.
        // In which case most of this can be moved into DataContainerFilesComponent.
        // task 1: get files to delete
        // task 2: delete files

        this.dialogService.confirm(`Delete files`, {
            description: event.isDirectory
                ? `All files will be deleted from the folder: ${path}`
                : `The file '${FileUrlUtils.getFileName(path)}' will be deleted.`,
            yes: () => {
                const listParams = { recursive: true, startswith: path };
                const data = this.storageService.listBlobs(Promise.resolve(this.container), listParams);
                return data.fetchAll().flatMap(() => data.items.take(1)).map((items) => {
                    data.dispose();
                    this.delete(items.toArray()).subscribe(() => {
                        this.fileNavigator.refresh(event.path);
                    });

                    return Observable.of(null);
                });
            },
        });
    }

    public get filterPlaceholder() {
        return "Filter by blob name (case sensitive)";
    }

    private _clearFileNavigator() {
        if (this.fileNavigator) {
            this.fileNavigator.dispose();
        }
    }
}
