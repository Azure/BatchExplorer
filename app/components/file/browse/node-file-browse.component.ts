import { Component, Input, OnChanges, OnDestroy } from "@angular/core";

import { FileExplorerConfig } from "app/components/file/browse/file-explorer";
import { Node } from "app/models";
import { FileService } from "app/services";
import { FileLoader, FileNavigator } from "app/services/file";
import "./node-file-browse.scss";

export interface Folder {
    name: string;
    friendlyName: string;
}
/**
 * Component for browsing node files.
 */
@Component({
    selector: "bl-node-file-browse",
    templateUrl: "node-file-browse.html",
})
export class NodeFileBrowseComponent implements OnChanges, OnDestroy {
    @Input() public poolId: string;
    @Input() public nodeId: string;
    @Input() public node: Node;
    /**
     * Optional root directory to display
     */
    @Input() public folder: string = "";
    @Input() public fileExplorerConfig: FileExplorerConfig;

    public fileNavigator: FileNavigator;
    public pickedFileLoader: FileLoader;

    constructor(private fileService: FileService) { }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId || inputs.folder) {
            this._clearFileNavigator();

            if (this.poolId && this.nodeId) {

                this.fileNavigator = this.fileService.navigateNodeFiles(this.poolId, this.nodeId, {
                    basePath: this.folder,
                });
                this.fileNavigator.init();
            }
        }
    }

    public ngOnDestroy() {
        this._clearFileNavigator();
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromNode(this.poolId, this.nodeId, filename);
    }

    public get quicksearchPlaceholder() {
        return "Filter by full file path";
    }

    private _clearFileNavigator() {
        if (this.fileNavigator) {
            this.fileNavigator.dispose();
        }
    }
}
