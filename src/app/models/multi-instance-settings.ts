import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { ResourceFile } from "./resource-file";

export interface MultiInstanceSettingsAttributes {
    numberOfInstances: number;
    coordinationCommandLine: string;
    commonResourceFiles: ResourceFile[];
}

/**
 * Settings which specify how to run a multi-instance task
 */
@Model()
export class MultiInstanceSettings extends Record<MultiInstanceSettingsAttributes> {
    @Prop() public numberOfInstances: number;
    @Prop() public coordinationCommandLine: string;
    @ListProp(ResourceFile) public commonResourceFiles: List<ResourceFile>;
}
