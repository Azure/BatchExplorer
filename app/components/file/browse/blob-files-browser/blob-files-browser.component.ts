import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";

import { FileExplorerConfig } from "app/components/file/browse/file-explorer";
import { StorageService } from "app/services";
import { FileNavigator } from "app/services/file";

@Component({
    selector: "bl-blob-files-browser",
    templateUrl: "blob-files-browser.html",
})
export class BlobFilesBrowserComponent implements OnChanges, OnDestroy {
    @Input() public container: string;
    @Input() public fileExplorerConfig: FileExplorerConfig = {};
    @Input() public activeFile: string;
    @Output() public activeFileChange = new EventEmitter<string>();

    public fileNavigator: FileNavigator;

    constructor(private storageService: StorageService) { }

    public refresh() {
        this.fileNavigator.refresh();
    }

    public ngOnChanges(inputs) {
        this._clearFileNavigator();

        if (inputs.container || inputs.jobId) {
            this.fileNavigator = this.storageService.navigateContainerBlobs(this.container);
            this.fileNavigator.init();
        }
    }

    public ngOnDestroy() {
        this._clearFileNavigator();
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
