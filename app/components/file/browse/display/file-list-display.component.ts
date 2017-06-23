import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { NodeState, TreeNodeData, TreeNodeOption } from "app/models/tree-component";
import { prettyBytes } from "app/utils";
import { Observable } from "rxjs/Observable";

import { IActionMapping, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from "angular-tree-component";

@Component({
    selector: "bl-file-list-display",
    templateUrl: "file-list-display.html",
})
export class FileListDisplayComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public files: List<File>;

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

    public NodeState = NodeState;
    public treeNodes: TreeNodeData[];
    public node: TreeNode;
    public treeOptions: TreeNodeOption;
    @ViewChild(TreeComponent)
    public tree: TreeComponent;

    public _currPath: string = "";

    constructor(private router: Router) { }

    public ngOnInit() {
        this.initNodes();
    }

    public prettyFileSize(size: string) {
        // having falsy issues with contentLength = 0
        return prettyBytes(parseInt(size || "0", 10));
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
    }

    public isErrorState(file: any) {
        return false;
    }

    /**
     * Initialize tree nodes function once loadPath callback function is ready
     */
    public initNodes() {
        if (this.loadPath) {
            const actionMapping: IActionMapping = { mouse: { expanderClick: null } };
            let filesObs = this.loadPath(this._currPath, false);
            filesObs.subscribe((files) => {
                if (!this.treeNodes && files.size > 0) {
                    this.treeNodes = files.map((file: File) => {
                        return {
                            name: file.name,
                            fileName: file.name,
                            hasChildren: file.isDirectory,
                            children: [] as TreeNodeData[],
                            state: file.isDirectory ? NodeState.COLLAPSED_DIRECTORY : NodeState.FILE,
                        } as TreeNodeData;
                    }).toArray();
                    this.treeOptions = { actionMapping: actionMapping } as TreeNodeOption;
                }
            });
        }
    }

    /**
     * Lazy initalize children nodes of current selected tree node
     * @param treeModel tree instance
     * @param treeNode tree node instance
     */
    public loadNodes(treeModel: TreeModel, treeNode: TreeNode) {
        let currTreeNode: TreeNodeData = treeNode.data;
        if (currTreeNode.children.length > 0) { return; }
        this._currPath = `${currTreeNode.fileName}\\`;
        let filesObs = this.loadPath(this._currPath, false);
        currTreeNode.state = NodeState.LOADING_DIRECTORY;
        filesObs.subscribe((files) => {
            currTreeNode.state = NodeState.EXPANDED_DIRECTORY;
            if (files.size > 0) {
                currTreeNode.hasChildren = true;
                currTreeNode.children = files.map((file: File) => {
                    return {
                        name: this.getNameFromPath(file),
                        fileName: file.name,
                        hasChildren: file.isDirectory,
                        children: [] as TreeNodeData[],
                        state: file.isDirectory ? NodeState.COLLAPSED_DIRECTORY : NodeState.FILE,
                    } as TreeNodeData;
                }).toArray();
                treeNode.expand();
            } else {
                currTreeNode.hasChildren = false;
                currTreeNode.children = [] as TreeNodeData[];
            }
            treeModel.update();
        });
    }

    /**
     * onClick callback function when tree node is selected
     * 1, If current selected path is a directory, call loadNodes function retrieving children nodes
     * 2, If current selected path is a file, then open file in content page
     * @param node tree node clicked
     * @param $event click event instance
     */
    public onClick(node: TreeNode, $event: any) {
        if (node.data.state !== NodeState.FILE) {
            if (node.data.state === NodeState.COLLAPSED_DIRECTORY) {
                this.loadNodes(this.tree.treeModel, node);
            } else if (node.data.state === NodeState.EXPANDED_DIRECTORY) {
                node.data.state = NodeState.COLLAPSED_DIRECTORY;
            }
            return TREE_ACTIONS.TOGGLE_EXPANDED(this.tree.treeModel, node, $event);
        }
        this.router.navigate(this.urlToFile(node.data.fileName));
        return TREE_ACTIONS.TOGGLE_SELECTED(this.tree.treeModel, node, $event);
    }

    /**
     * Helper function that constructs the display name of tree node, and
     * the file contains file size property in display name
     * @param file
     */
    public getNameFromPath(file: File) {
        let tokens = file.name.split("\\");
        let displayName = tokens[tokens.length - 1];
        return (file.isDirectory) ?
            displayName : `${displayName} (${this.prettyFileSize(file.properties.contentLength.toString())})`;
    }
}
