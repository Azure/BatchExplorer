import { IActionMapping } from "angular-tree-component/dist/angular-tree-component";

export enum NodeState {
    COLLAPSED_DIRECTORY,
    EXPANDED_DIRECTORY,
    LOADING_DIRECTORY,
    FILE,
}

export class TreeNodeData {
    public id: number;
    public name: string;
    public fileName: string;
    public hasChildren: boolean;
    public children: TreeNodeData[];
    public state: NodeState;
}

export class TreeNodeOption {
    public actionMapping: IActionMapping;
}
