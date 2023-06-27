import { Model, Prop, Record } from "@batch-flask/core";

export interface NodeAgentInformationAttributes {
    lastUpdateTime: Date;
    version: string;
}

@Model()
export class NodeAgentInformation extends Record<NodeAgentInformationAttributes> {
    @Prop() public lastUpdateTime: Date;
    @Prop() public version: string;
}
