import { Component, Input, OnChanges, OnDestroy } from "@angular/core";

import { StorageService } from "app/services";
import { FileNavigator } from "app/services/file";

@Component({
    selector: "bl-persisted-file-list",
    templateUrl: "persisted-file-list.html",
})
export class PersistedFileListComponent implements OnChanges, OnDestroy {
    @Input()
    public container: string;

    public fileNavigator: FileNavigator;

    constructor(private storageService: StorageService) { }

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
