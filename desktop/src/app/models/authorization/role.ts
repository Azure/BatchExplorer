import { ArmRecord, ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface RoleDefinitionPropertiesAttributes {
    roleName: string;
    type: string;
    description: string;
    permissions: any[];
}

@Model()
export class RoleDefinitionProperties extends Record<RoleDefinitionPropertiesAttributes> {
    @Prop() public roleName: string;
    @Prop() public type: string;
    @Prop() public description: string;
    @ListProp(Object) public permissions: List<any>;
}

export interface RoleDefinitionAttributes {
    id: string;
    name: string;
    type: string;
    properties: RoleDefinitionPropertiesAttributes;
}

@Model()
export class RoleDefinition extends ArmRecord<RoleDefinitionAttributes> {
    public type: "Microsoft.Authorization/roleDefinitions";

    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public properties: RoleDefinitionProperties;
}
