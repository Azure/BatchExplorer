import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from "angular-tree-component";
import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { NodeState, TreeNodeData } from "app/models/tree-component";
import { TreeComponentService } from "app/services";
import { prettyBytes } from "app/utils";
import { List } from "immutable";
import { Observable } from "rxjs/Observable";

@Component({
    selector: "bl-file-list-display",
    templateUrl: "file-list-display.html",
})
export class FileListDisplayComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean; // remove later

    @Input()
    public files: List<File>; // remove later

    @Input()
    public status: LoadingStatus; // ??

    @Input()
    public filter: any; // ??

    @Input()
    public baseUrl: any[]; // routing?

    /**
     * If true then create link to /blobs/filename rather than /files/filename
     */
    @Input()
    public isBlob: boolean = false; // ??

    @Input()
    public loadPath: (path: string, refresh?: boolean) => Observable<List<File>>;

    public NodeState = NodeState;

    /** TreeModel instance variables */
    public node: TreeNode;
    // public treeNodes: TreeNodeData[];
    // public treeOptions: TreeNodeOption;

    @ViewChild(TreeComponent)
    public tree: TreeComponent;

    private _currPath: string = "";

    constructor(public treeComponentService: TreeComponentService,
                // private route: ActivatedRoute,
                private router: Router) { }

    public ngOnInit() {
        console.log("what is this value?", this.treeComponentService.treeNodes);
        this.tree.treeModel.expandAll();
        this.initNodes();
        // this.route.queryParams.subscribe(params => {
        //     if (params["expandedNodes"]) {
        //         const expandedNodes = JSON.parse(params["expandedNodes"]);
        //         this.tree.treeModel.expandAll();
        //         console.log(this.tree.treeModel.nodes, "da sb");
        //         expandedNodes.map((nodeId) => {
        //             // let treeNode: TreeNode = this.tree.treeModel.getNodeById(nodeId);
        //             // if (treeNode.data.state === NodeState.EXPANDED_DIRECTORY) {
        //             //     treeNode.expand();
        //             // }
        //         });
        //         this.tree.treeModel.update();
        //     } else {
        //         this.initNodes();
        //     }
        // });
    }

    /**
     * Initialize tree nodes function once loadPath callback function is ready
     */
    public initNodes(currPath?: string) {
        if (this.loadPath) {
            if (currPath || !this.treeComponentService.treeNodes) {
                let filesObs = this.loadPath(currPath || this._currPath, false);
                filesObs.subscribe((files) => {
                    if (files.size > 0) {
                        this.treeComponentService.treeNodes = files.map(mapFileToTree).toArray();
                        this.tree.treeModel.update();
                    }
                });
            }
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
                currTreeNode.children = files.map(mapFileToTree).toArray();
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
        // node.focus();
        // console.log(this.tree.treeModel.expandedNodes, this.tree.treeModel.expandedNodeIds);
        const queryParams = {
            queryParams: {
                expandedNodes: JSON.stringify(
                    this.tree.treeModel.expandedNodes.map((nodeElement: TreeNode) => node.data.id)),
            },
        };
        this.router.navigate(this.urlToFile(node.data.fileName), queryParams);
        return TREE_ACTIONS.TOGGLE_SELECTED(this.tree.treeModel, node, $event);
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

}

function prettyFileSize(size: string) {
    // having falsy issues with contentLength = 0
    return prettyBytes(parseInt(size || "0", 10));
}

function getNameFromPath(file: File) {
    let tokens = file.name.split("\\");
    let displayName = tokens[tokens.length - 1];
    return (file.isDirectory) ?
        displayName : `${displayName} (${prettyFileSize(file.properties.contentLength.toString())})`;
}

function mapFileToTree(file: File) {
    return {
        name: getNameFromPath(file),
        fileName: file.name,
        hasChildren: file.isDirectory,
        children: [] as TreeNodeData[],
        state: file.isDirectory ? NodeState.COLLAPSED_DIRECTORY : NodeState.FILE,
    } as TreeNodeData;
}
