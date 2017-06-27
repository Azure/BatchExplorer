import { IActionMapping } from "angular-tree-component";
import { TreeNodeData, TreeNodeOption } from "app/models/tree-component";

export class TreeComponentService {
    /** TreeModel instance variables */
    public treeNodes: TreeNodeData[];
    public treeOptions: TreeNodeOption;

    constructor() {
        const actionMapping: IActionMapping = { mouse: { expanderClick: null } };
        this.treeNodes = [] as TreeNodeData[];
        this.treeOptions = { actionMapping: actionMapping } as TreeNodeOption;
    }
}
