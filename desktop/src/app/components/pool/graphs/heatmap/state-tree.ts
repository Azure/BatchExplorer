import { NodeState } from "app/models";

export interface StateNode {
    state: NodeState;
    color: string;
}

export interface CategoryNode {
    category: string;
    label: string;
    subtitle?: string;
    color: string;
    states: StateNode[];
}

export type StateTree = Array<StateNode | CategoryNode>;
