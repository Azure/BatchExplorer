import { Component, Input, OnChanges, ViewChild, forwardRef } from "@angular/core";

import { NodeFileListComponent } from "app/components/file/browse";
import { FileDetailsQuickviewComponent } from "app/components/file/details";
import { File, Node } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
import { FileLoader } from "app/services/file";
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
export class NodeFileBrowseComponent implements OnChanges {
    @Input()
    public poolId: string;

    @Input()
    public nodeId: string;

    @Input()
    public node: Node;

    public data: RxListProxy<NodeFileListParams, File>;

    @ViewChild(FileDetailsQuickviewComponent)
    public quickview: FileDetailsQuickviewComponent;

    // tslint:disable-next-line:no-forward-ref
    @ViewChild(forwardRef(() => NodeFileListComponent))
    public list: NodeFileListComponent;

    public pickedFileLoader: FileLoader;

    constructor(private fileService: FileService) {
        this.data = this.fileService.listFromComputeNode(null, null, false);
    }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId) {
            this.data.updateParams({ poolId: this.poolId, nodeId: this.nodeId });
            this.data.fetchNext(true);
        }
    }

    public updatePickedFile(filename) {
        this.pickedFileLoader = this.fileService.fileFromNode(this.poolId, this.nodeId, filename);
    }

    public get quicksearchPlaceholder() {
        return "Filter by full file path";
    }
}
