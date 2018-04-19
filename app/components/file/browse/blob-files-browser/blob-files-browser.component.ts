import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { Observable } from "rxjs";

import { DialogService } from "@batch-flask/ui/dialogs";
import { FileDeleteEvent, FileDropEvent, FileExplorerConfig } from "app/components/file/browse/file-explorer";
import { File } from "app/models";
import { FileNavigator } from "app/services/file";
import { StorageBlobService } from "app/services/storage";
import { FileUrlUtils } from "app/utils";

@Component({
    selector: "bl-blob-files-browser",
    templateUrl: "blob-files-browser.html",
})
export class BlobFilesBrowserComponent implements OnChanges, OnDestroy {
    @Input() public storageAccountId: string;
    @Input() public container: string;
    @Input() public fileExplorerConfig: FileExplorerConfig = {};
    @Input() public activeFile: string;
    @Input() public filter: string;
    @Input() public fetchAll: boolean = false;
    @Input() public upload: (event: FileDropEvent) => Observable<any>;

    @Output() public activeFileChange = new EventEmitter<string>();

    public fileNavigator: FileNavigator;

    constructor(
        private storageBlobService: StorageBlobService,
        private dialogService: DialogService) {
    }

    public refresh() {
        this.fileNavigator.refresh();
    }

    public ngOnChanges(inputs) {
        this._clearFileNavigator();
        if (inputs.storageAccountId || inputs.container || inputs.filter || inputs.fetchAll) {
            // TODO: [Tim] - handle here (unsure what this comment was about so leaving it here)
            const options = {
                wildcards: this.filter,
                fetchAll: this.fetchAll,
            };
            this.fileNavigator = this.storageBlobService.navigate(this.storageAccountId, this.container, null, options);
            this.fileNavigator.init();
        }

        if (inputs.upload) {
            this.fileExplorerConfig = {
                canDropExternalFiles: Boolean(this.upload),
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

    public get filterPlaceholder() {
        return "Filter by blob name (case sensitive)";
    }

    private _clearFileNavigator() {
        if (this.fileNavigator) {
            this.fileNavigator.dispose();
        }
    }
}
