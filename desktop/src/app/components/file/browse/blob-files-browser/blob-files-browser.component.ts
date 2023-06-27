import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { FileExplorerConfig, FileNavigator } from "@batch-flask/ui";
import { StorageBlobService } from "app/services/storage";

@Component({
    selector: "bl-blob-files-browser",
    templateUrl: "blob-files-browser.html",
})
export class BlobFilesBrowserComponent implements OnChanges, OnDestroy {
    @Input() public storageAccountId: string;
    @Input() public container: string;
    @Input() public fileExplorerConfig: FileExplorerConfig = {
        canDropExternalFiles: true,
    };
    @Input() public activeFile: string;
    @Input() public filter: string;
    @Input() public fetchAll: boolean = false;

    @Output() public activeFileChange = new EventEmitter<string>();

    public fileNavigator: FileNavigator;

    constructor(
        private storageBlobService: StorageBlobService) {
    }

    public refresh() {
        this.fileNavigator.refresh();
    }

    public ngOnChanges(inputs) {
        this._clearFileNavigator();
        if (inputs.storageAccountId || inputs.container || inputs.filter || inputs.fetchAll) {
            const options = {
                wildcards: this.filter,
                fetchAll: this.fetchAll,
            };
            this.fileNavigator = this.storageBlobService.navigate(this.storageAccountId, this.container, null, options);
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
