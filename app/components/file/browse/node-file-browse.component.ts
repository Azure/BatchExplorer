import { Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { File, Node } from "app/models";
import { FileService, NodeFileListParams, TreeComponentService } from "app/services";
import { RxListProxy } from "app/services/core";

const folderFriendlyName = {
    workitems: "Job task files",
    shared: "Shared files",
    startup: "Start task files",
    applications: "Application packages files",
};

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
    public node: Node;

    public data: RxListProxy<NodeFileListParams, File>;
    public folders: List<Folder>;
    public currentFolder: string = null;

    constructor(private treeComponentService: TreeComponentService, private fileService: FileService) {
        this.data = this.fileService.listFromComputeNode(null, null, false);
        this.data.items.subscribe((files) => {
            this.folders = List<Folder>(files.map(x => {
                return {
                    name: x.name,
                    friendlyName: folderFriendlyName[x.name],
                };
            }));
        });
    }

    public ngOnChanges(inputs) {
        if (inputs.poolId && inputs.node) {
            this.currentFolder = null;
            this.treeComponentService.treeNodes = [];
            this.data.updateParams({ poolId: this.poolId, nodeId: this.node.id });
            this.data.fetchNext(true);
        }
    }

    public selectFolder(folderName: string) {
        this.currentFolder = folderName;
    }

    public get quicksearchPlaceholder() {
        if (this.currentFolder) {
            return `Filter by file name under folder "${this.currentFolder}"`;
        } else {
            return "Filter by file name";
        }
    }
}
