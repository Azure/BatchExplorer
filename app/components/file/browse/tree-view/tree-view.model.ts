import { IActionMapping } from "angular-tree-component/dist/angular-tree-component";

export enum FileState {
    COLLAPSED_DIRECTORY,
    EXPANDED_DIRECTORY,
    LOADING_DIRECTORY,
    FILE,
    MORE_BUTTON,
}

export class TreeNodeData {
    public id: any;

    /**
     * Just the filename TODO change
     */
    public name: string;

    /**
     * Full path
     */
    public fileName: string;
    public hasChildren: boolean;
    public children: TreeNodeData[];
    public state: FileState;
}

export class TreeNodeOption {
    public actionMapping: IActionMapping;
}
