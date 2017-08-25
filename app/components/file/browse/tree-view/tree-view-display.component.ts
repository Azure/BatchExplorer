import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from "@angular/core";
import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from "angular-tree-component";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileNavigator, FileTreeNode, FileTreeStructure } from "app/services/file";
import "./tree-view-display.scss";
import { mapFilesToTree } from "./tree-view-helper";
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

            console.log("NAv changed...");
            this._clearTreeSub();

            this._treeSub = this.fileNavigator.tree.subscribe((tree) => {
                console.log("Got a new tree", tree);
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
     * Initialize treenode by given path, path default to ""
     * @param currPath
     */
    public initNodes(currentPath: string, force: boolean = false): Observable<any> {
        const pathToLoad = currentPath || "";
        let filesObservable = this.loadPath(pathToLoad, force);
        filesObservable.subscribe((files) => {
            // Only map tree children when this function is first time loaded or 'force' is true
            if (this.treeNodes.length === 0 || force) {
                let nodes = mapFilesToTree(files, pathToLoad);
                nodes = this._decorateNodesWithMoreOption(nodes, pathToLoad);
                this.treeNodes = (files.size > 0) ? nodes : [];

                setTimeout(() => {
                    this.tree.treeModel.doForAll((node) => {
                        if (node.data.children.length > 0) {
                            node.data.state = FileState.EXPANDED_DIRECTORY;
                            return node.expand();
                        }
                    });
                });
            }
        });

        return filesObservable;
    }

    /**
     * Lazy initalize children nodes of current selected tree node
     * @param treeModel tree instance
     * @param treeNode tree node instance
     */
    public loadNodes(treeModel: TreeModel, treeNode: TreeNode) {
        const currTreeNode: TreeNodeData = treeNode.data;
        const pathToLoad = currTreeNode.fileName ? `${currTreeNode.fileName}\/` : "";
        const filesObs = this.loadPath(pathToLoad, false);
        currTreeNode.state = FileState.LOADING_DIRECTORY;
        filesObs.subscribe((files) => {
            currTreeNode.hasChildren = (files.size > 0);
            let nodes = mapFilesToTree(files, pathToLoad);
            nodes = this._decorateNodesWithMoreOption(nodes, pathToLoad);
            // Special root level nodes
            if (pathToLoad === "") {
                this.treeNodes = (files.size > 0) ? nodes : [];
                this.tree.treeModel.update();
            } else {
                currTreeNode.children = (files.size > 0) ? nodes : [];
                currTreeNode.state = FileState.EXPANDED_DIRECTORY;
                treeNode.expand();
                treeModel.update();
            }
        });
    }

    /**
     * Method to call when user want to expand a directory
     */
    public expandDirectory(treeModel: TreeModel, treeNode: TreeNode) {
        const nodeData = treeNode.data;
        if (treeNode.data.children.length > 0) {
            nodeData.state = FileState.EXPANDED_DIRECTORY;
            treeNode.expand();
            return;
        }

        this.loadNodes(treeModel, treeNode);
    }

    /**
     * onNodeClick event handler when tree node is clicked
     * 1, If current selected node is 'load more(...)' option, then call load path for fetching next nodes
     * 2, If current selected path is a file, then open file in content page
     * 3, If current selected path is a directory, call loadNodes function retrieving children nodes
     *    and toggle folder expand/collpase status
     * @param node tree node clicked
     * @param $event click event instance
     */
    public onNodeClick(node: TreeNode, $event: any) {
        let nodeState: FileState = node.data.state;
        switch (nodeState) {
            case FileState.MORE_BUTTON:
                this.loadNodes(node.parent.treeModel, node.parent);
                break;
            case FileState.FILE:
                this.treeNodeClicked.emit(node.data.fileName);
                return TREE_ACTIONS.TOGGLE_SELECTED(node.treeModel, node, $event);
            case FileState.COLLAPSED_DIRECTORY:
                this.expandDirectory(node.treeModel, node);
                node.data.state = FileState.EXPANDED_DIRECTORY;
                return node.expand();
            case FileState.EXPANDED_DIRECTORY:
                node.data.state = FileState.COLLAPSED_DIRECTORY;
                return node.collapse();
            default:
                break;
        }
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
    }

    /**
     * Helper function that decides to push a 'load more (...)' button if necessary
     * @param nodes tree nodes array
     * @param pathToLoad path to check with more items
     */
    private _decorateNodesWithMoreOption(nodes: TreeNodeData[], pathToLoad: string): TreeNodeData[] {
        if (this.hasMoreMap && this.hasMoreMap[pathToLoad]) {
            nodes.push(this._getFetchMoreNode(pathToLoad));
        }
        return nodes;
    }

    /**
     * Helper function that helps to construct 'LoadMore(...)' tree node
     * @param pathToReload used by proxy fetchNext function
     */
    private _getFetchMoreNode(pathToReload: string): TreeNodeData {
        return {
            name: "....",
            fileName: pathToReload,
            hasChildren: false,
            children: [] as TreeNodeData[],
            state: FileState.MORE_BUTTON,
        } as TreeNodeData;
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
            console.log("Clear tree sub");
            this._treeSub.unsubscribe();
        }
    }
}
