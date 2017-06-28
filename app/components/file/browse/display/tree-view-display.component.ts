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

    public NodeState = NodeState;

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
    public initNodes(currentPath: string, force: boolean = false) {
        let filesObs = this.loadPath(currentPath || "", false);
        filesObs.subscribe((files) => {
            if (this.treeComponentService.treeNodes.length === 0 || force) {
                this.treeComponentService.treeNodes = (files.size > 0) ? files.map(mapFileToTree).toArray() : [];
            }
            this.tree.treeModel.doForAll((node: TreeNode) => {
                if (node.data.state === NodeState.EXPANDED_DIRECTORY) {
                    node.expand();
                }
            });
            this.tree.treeModel.update();
        });
    }

    /**
     * Lazy initalize children nodes of current selected tree node
     * @param treeModel tree instance
     * @param treeNode tree node instance
     */
    public loadNodes(treeModel: TreeModel, treeNode: TreeNode) {
        let currTreeNode: TreeNodeData = treeNode.data;
        let filesObs = this.loadPath(`${currTreeNode.fileName}\\`, false);
        currTreeNode.state = NodeState.LOADING_DIRECTORY;
        filesObs.subscribe((files) => {
            currTreeNode.hasChildren = (files.size > 0);
            currTreeNode.children = (files.size > 0) ? files.map(mapFileToTree).toArray() : [];
            currTreeNode.state = NodeState.EXPANDED_DIRECTORY;
            treeNode.expand();
            treeModel.update();
        });
    }

    /**
     * onNodeClick event handler when tree node is selected
     * 1, If current selected path is a directory, call loadNodes function retrieving children nodes
     * 2, If current selected path is a file, then open file in content page
     * @param node tree node clicked
     * @param $event click event instance
     */
    public onNodeClick(node: TreeNode, $event: any) {
        if (node.data.state !== NodeState.FILE) {
            if (node.data.state === NodeState.COLLAPSED_DIRECTORY) {
                this.loadNodes(node.treeModel, node);
            } else if (node.data.state === NodeState.EXPANDED_DIRECTORY) {
                node.data.state = NodeState.COLLAPSED_DIRECTORY;
            }
            return TREE_ACTIONS.TOGGLE_EXPANDED(node.treeModel, node, $event);
        }
        this.router.navigate(this.urlToFile(node.data.fileName));
        return TREE_ACTIONS.TOGGLE_SELECTED(node.treeModel, node, $event);
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
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
