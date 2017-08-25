import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from "@angular/core";
import { TreeComponent, TreeNode } from "angular-tree-component";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileNavigator, FileTreeNode, FileTreeStructure } from "app/services/file";
import "./tree-view-display.scss";
import { FileState, TreeNodeData, TreeNodeOption } from "./tree-view.model";

export interface TreeRow {
    name: string;
    path: string;
    expanded: boolean;
    isDirectory: boolean;
    indent: number;
}

@Component({
    selector: "bl-tree-view-display",
    templateUrl: "tree-view-display.html",
})
export class TreeViewDisplayComponent implements OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;

    @Input() public status: LoadingStatus;

    @Input() public filter: any;

    @Input() public baseUrl: any[];

    /**
     * If true then create link to /blobs/filename rather than /files/filename
     */
    @Input() public isBlob: boolean = false;

    @Input() public loadPath: (path: string, refresh?: boolean) => Observable<List<File>>;

    @Input() public hasMoreMap: StringMap<boolean>;

    @Output() public treeNodeClicked = new EventEmitter<string>();

    @ViewChild(TreeComponent) public tree: TreeComponent;

    public FileState = FileState;
    public node: TreeNode;
    public expandedDirs: Set<string> = new Set();

    public treeNodes: TreeNodeData[] = [];
    public treeOptions: TreeNodeOption = { actionMapping: { mouse: { expanderClick: null } } };
    public treeRows: TreeRow[] = [];
    private _tree: FileTreeStructure;
    private _treeSub: Subscription;

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this._clearTreeSub();

            this._treeSub = this.fileNavigator.tree.subscribe((tree) => {
                this._tree = tree;
                this._buildTreeRows(tree);
            });
        }
    }

    public ngOnDestroy() {
        this._clearTreeSub();
    }

    public handleClick(treeRow: TreeRow) {
        this.toggleExpanded(treeRow);
        if (!this.expandedDirs.has(treeRow.path)) {
            this.fileNavigator.navigateTo(treeRow.path);
        }
    }

    public toggleExpanded(treeRow: TreeRow) {
        if (this.expandedDirs.has(treeRow.path)) {
            this.expandedDirs.delete(treeRow.path);
        } else {
            this.expandedDirs.add(treeRow.path);
            this.fileNavigator.navigateTo(treeRow.path);
        }
        this._buildTreeRows(this._tree);
    }

    public treeRowTrackBy(treeRow: TreeRow) {
        return treeRow.path;
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
    }

    private _buildTreeRows(tree) {
        const root = tree.root;
        this.treeRows = this._getTreeRowsForNode(root);
    }

    private _getTreeRowsForNode(node: FileTreeNode, indent = 0): TreeRow[] {
        let rows = [];
        for (let child of node.children) {
            const expanded = this.expandedDirs.has(child.path);
            rows.push({
                name: child.name,
                path: child.path,
                expanded,
                isDirectory: child.isDirectory,
                indent: indent,
            });
            if (expanded) {
                if (child.children.length > 0) {
                    for (let row of this._getTreeRowsForNode(child, indent + 1)) {
                        rows.push(row);
                    }
                }
            }
        }
        return rows;
    }

    private _clearTreeSub() {
        if (this._treeSub) {
            this._treeSub.unsubscribe();
        }
    }
}
