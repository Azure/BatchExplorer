import { Model, Prop, Record } from "@batch-flask/core";

export interface ResourceGroupAttributes {
    id: string;
    location: string;
    managedBy: string;
    name: string;
    properties: any;
    tags: any;
}

/**
 * Class for resource group information
 */
@Model()
export class ResourceGroup extends Record<ResourceGroupAttributes> {
    @Prop() public id: string;
    @Prop() public location: string;
    @Prop() public managedBy: string;
    @Prop() public name: string;
    @Prop() public properties: any;
    @Prop() public tags: any;
}
