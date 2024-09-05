import { Model, Record, Prop } from "@batch-flask/core/record";

export interface NodeAgentInformationAttributes {
    lastUpdateTime: Date;
    version: string;
}

@Model()
export class NodeAgentInformation extends Record<NodeAgentInformationAttributes> {
    @Prop() public lastUpdateTime: Date;
    @Prop() public version: string;
}
