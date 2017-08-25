import { Component, Input, OnChanges, OnDestroy, ViewChild, forwardRef } from "@angular/core";

import { NodeFileListComponent } from "app/components/file/browse";
import { FileDetailsQuickviewComponent } from "app/components/file/details";
import { File, Node } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
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

    public fileNavigator: FileNavigator;
    public pickedFileLoader: FileLoader;

    constructor(private fileService: FileService) {
    }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId) {
            this._clearFileNavigator();

            if (this.poolId && this.nodeId) {

                this.fileNavigator = this.fileService.navigateNodeFiles(this.poolId, this.nodeId);
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
