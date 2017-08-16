import { Component, Input, OnChanges, ViewChild, forwardRef } from "@angular/core";

import { NodeFileListComponent } from "app/components/file/browse";
import { FileDetailsQuickviewComponent } from "app/components/file/details";
import { IfileDetails } from "app/components/file/details/file-details-quickview.component";
import { File, Node } from "app/models";
import { FileService, NodeFileListParams } from "app/services";
import { RxListProxy } from "app/services/core";
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
    public options: IfileDetails;

    @ViewChild(FileDetailsQuickviewComponent)
    public quickview: FileDetailsQuickviewComponent;

    // tslint:disable-next-line:no-forward-ref
    @ViewChild(forwardRef(() => NodeFileListComponent))
    public list: NodeFileListComponent;

    constructor(private fileService: FileService) {
        this.data = this.fileService.listFromComputeNode(null, null, false);
    }

    public ngOnChanges(inputs) {
        if (inputs.poolId || inputs.nodeId) {
            this.options = {
                sourceType: "pool",
                poolId: this.poolId,
                nodeId: this.nodeId,
            } as IfileDetails;
            this.data.updateParams({ poolId: this.poolId, nodeId: this.nodeId });
            this.data.fetchNext(true);
        }
    }

    public updateOptions(event) {
        this.quickview.filename = event;
        this.quickview.initFileLoader();
    }

    public get quicksearchPlaceholder() {
        return "Filter by full file path";
    }
}
