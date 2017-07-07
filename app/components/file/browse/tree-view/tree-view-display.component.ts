import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";

import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from "angular-tree-component";
import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileState, TreeNodeData } from "app/models/tree-component";
import { TreeComponentService } from "app/services";
import { List } from "immutable";
import { Observable } from "rxjs/Observable";
import "./tree-view-display.scss";
import { mapFileToTree } from "./tree-view-helper";

@Component({
    selector: "bl-tree-view-display",
    templateUrl: "tree-view-display.html",
})
export class TreeViewDisplayComponent implements OnInit {
    @Input()
    public status: LoadingStatus;

    @Input()
    public filter: any;

    @Input()
    public baseUrl: any[];

    /**
     * If true then create link to /blobs/filename rather than /files/filename
     */
    @Input()
    public isBlob: boolean = false;

    @Input()
    public loadPath: (path: string, refresh?: boolean) => Observable<List<File>>;

    @Input()
    public hasMoreMap: StringMap<boolean>;

    public FileState = FileState;
    public node: TreeNode;

    @ViewChild(TreeComponent)
    public tree: TreeComponent;

    constructor(public treeComponentService: TreeComponentService, private router: Router) { }

    public ngOnInit() {
        this.initNodes("");
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
            if (this.treeComponentService.treeNodes.length === 0 || force) {
                let nodes = files.map(mapFileToTree).toArray();
                nodes = this._decorateNodesWithMoreOption(nodes, pathToLoad);
                this.treeComponentService.treeNodes = (files.size > 0) ? nodes : [];
            }
            this.expandTreeNodes();
        });
        return filesObservable;
    }

    /**
     * Lazy initalize children nodes of current selected tree node
     * @param treeModel tree instance
     * @param treeNode tree node instance
     */
    public loadNodes(treeModel: TreeModel, treeNode: TreeNode) {
        let currTreeNode: TreeNodeData = treeNode.data;
        const pathToLoad = currTreeNode.fileName ? `${currTreeNode.fileName}\/` : "";
        let filesObs = this.loadPath(pathToLoad, false);
        currTreeNode.state = FileState.LOADING_DIRECTORY;
        filesObs.subscribe((files) => {
            currTreeNode.hasChildren = (files.size > 0);
            let nodes = files.map(mapFileToTree).toArray();
            nodes = this._decorateNodesWithMoreOption(nodes, pathToLoad);
            // Special root level nodes
            if (pathToLoad === "") {
                this.treeComponentService.treeNodes = (files.size > 0) ? nodes : [];
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
                this.router.navigate(this.urlToFile(node.data.fileName));
                return TREE_ACTIONS.TOGGLE_SELECTED(node.treeModel, node, $event);
            case FileState.COLLAPSED_DIRECTORY:
                this.loadNodes(node.treeModel, node);
                return TREE_ACTIONS.TOGGLE_EXPANDED(node.treeModel, node, $event);
            case FileState.EXPANDED_DIRECTORY:
                node.data.state = FileState.COLLAPSED_DIRECTORY;
                return TREE_ACTIONS.TOGGLE_EXPANDED(node.treeModel, node, $event);
        }
        return null;
    }

    /**
     * Recursively expand tree nodes if current node has expanded status
     */
    public expandTreeNodes(): void {
        // Keep tree nodes expanded if routing to a different route
        this.tree.treeModel.doForAll((node: TreeNode) => {
            if (node.data.state === FileState.EXPANDED_DIRECTORY) {
                node.expand();
            }
        });
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
}
