import { ArmRecord, Model, Prop, Record } from "@batch-flask/core";

export enum RoleAssignmentPrincipalType {
    App = "ServicePrincipal",
    User = "User",
}

export interface RoleAssignmentPropertiesAttributes {
    principalId: string;
    principalType: RoleAssignmentPrincipalType;
    roleDefinitionId: string;
    scope: string;
    createdOn: Date;
    updatedOn: Date;
    createdBy: string;
    updatedBy: string;
}

@Model()
export class RoleAssignmentProperties extends Record<RoleAssignmentPropertiesAttributes> {
    @Prop() public principalId: string;
    @Prop() public principalType: RoleAssignmentPrincipalType;
    @Prop() public roleDefinitionId: string;
    @Prop() public scope: string;
    @Prop() public createdOn: Date;
    @Prop() public updatedOn: Date;
    @Prop() public createdBy: string;
    @Prop() public updatedBy: string;
}

export interface RoleAssignmentAttributes {
    id: string;
    name: string;
    type: string;
    properties: RoleAssignmentPropertiesAttributes;
}

@Model()
export class RoleAssignment extends ArmRecord<RoleAssignmentAttributes> {
    public type: "Microsoft.Authorization/roleAssignments";

    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public properties: RoleAssignmentProperties;
}
