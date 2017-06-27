
import { ViewChild } from "@angular/core";
import { IActionMapping, TreeComponent } from "angular-tree-component";
import { TreeNodeData, TreeNodeOption } from "app/models/tree-component";

export class TreeComponentService {
    /** TreeModel instance variables */
    public treeNodes: TreeNodeData[];
    public treeOptions: TreeNodeOption;

    @ViewChild(TreeComponent)
    public tree: TreeComponent;

    constructor() {
        const actionMapping: IActionMapping = { mouse: { expanderClick: null } };
        this.treeNodes = [] as TreeNodeData[];
        this.treeOptions = { actionMapping: actionMapping } as TreeNodeOption;
    }
}
