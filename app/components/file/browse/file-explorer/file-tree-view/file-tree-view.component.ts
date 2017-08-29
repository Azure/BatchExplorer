import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { FileNavigator, FileTreeNode, FileTreeStructure } from "app/services/file";
import "./file-tree-view.scss";

export interface TreeRow {
    name: string;
    path: string;
    expanded: boolean;
    isDirectory: boolean;
    indent: number;
}

@Component({
    selector: "bl-file-tree-view",
    templateUrl: "file-tree-view.html",
})
export class FileTreeViewComponent implements OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;
    @Input() public name: string;
    @Input() public autoExpand = false;
    @Output() public navigate = new EventEmitter<string>();

    public expanded = true;
    public currentNode: FileTreeNode;
    public expandedDirs: StringMap<boolean> = {};

    public treeRows: TreeRow[] = [];
    private _tree: FileTreeStructure;
    private _navigatorSubs: Subscription[] = [];

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this._clearNavigatorSubs();

            this._navigatorSubs.push(this.fileNavigator.tree.subscribe((tree) => {
                this._tree = tree;
                this._buildTreeRows(tree);
            }));

            this._navigatorSubs.push(this.fileNavigator.currentNode.subscribe((node) => {
                if (!this.currentNode || node.path !== this.currentNode.path) {
                    this.expandPath(node.path);
                }
                this.currentNode = node;
            }));
        }
    }

    public ngOnDestroy() {
        this._clearNavigatorSubs();
    }

    public handleClick(treeRow: TreeRow) {
        if (treeRow.isDirectory && !treeRow.expanded) {
            this.toggleExpanded(treeRow);
        }
        this.navigate.emit(treeRow.path);
        this.fileNavigator.navigateTo(treeRow.path);
    }

    public handleCaretClick(treeRow: TreeRow, event: MouseEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.toggleExpanded(treeRow);
    }

    /**
     * @param treeRow Tree row that should toggle the expansion
     * @returns boolean if the row is now expanded or not
     */
    public toggleExpanded(treeRow: TreeRow): boolean {
        const isExpanded = this.expandedDirs[treeRow.path];
        if (isExpanded) {
            this.expandedDirs[treeRow.path] = false;
        } else {
            this.expandedDirs[treeRow.path] = true;
        }
        this._buildTreeRows(this._tree);
        return !isExpanded;
    }

    /**
     * Expand all folder down to the given path
     */
    public expandPath(path: string) {
        if (path === "") { return; }
        const segments = path.split("/");
        for (let i = 0; i < segments.length; i++) {

            const pathToExpand = segments.slice(0, segments.length - i).join("/");
            this.expandedDirs[pathToExpand] = true;
        }
        if (this._tree) {
            this._buildTreeRows(this._tree);
        }
    }

    public handleClickTreeViewHeader() {
        this.expanded = true;
        this.navigate.emit("");
        this.fileNavigator.navigateTo("");
    }

    /**
     * Toggle expanding the global tree view
     */
    public toggleExpandTreeView(): boolean {
        this.expanded = !this.expanded;
        return this.expanded;
    }

    public collapseAll() {
        for (let key of Object.keys(this.expandedDirs)) {
            this.expandedDirs[key] = false;
        }
        this._buildTreeRows(this._tree);
    }

    public treeRowTrackBy(treeRow: TreeRow) {
        return treeRow.path;
    }

    public refresh() {
        this.fileNavigator.refresh();
    }

    private _buildTreeRows(tree) {
        const root = tree.root;
        this.treeRows = this._getTreeRowsForNode(root);
    }

    private _getTreeRowsForNode(node: FileTreeNode, indent = 0): TreeRow[] {
        let rows = [];
        for (let [_, child] of node.children) {
            if (this.autoExpand && !(child.path in this.expandedDirs)) {
                this.expandedDirs[child.path] = true;
            }
            const expanded = this.expandedDirs[child.path];
            rows.push({
                name: child.name,
                path: child.path,
                expanded,
                isDirectory: child.isDirectory,
                indent: indent,
            });
            if (expanded) {
                if (child.children.size > 0) {
                    for (let row of this._getTreeRowsForNode(child, indent + 1)) {
                        rows.push(row);
                    }
                }
            }
        }
        return rows;
    }

    private _clearNavigatorSubs() {
        this._navigatorSubs.forEach(x => x.unsubscribe());
    }
}
