import { ListProp, Model, Prop, Record } from "@batch-flask/core/record";
import { List } from "immutable";

export interface UserAssignedIdentityAttributes {
    resourceId: string;
    clientId: string;
    principalId: string;
}

export interface BatchPoolIdentityAttributes {
    type: string;
    userAssignedIdentities: List<UserAssignedIdentity>;
}

@Model()
export class UserAssignedIdentity extends Record<UserAssignedIdentityAttributes> {
    @Prop() resourceId: string;
    @Prop() clientId: string;
    @Prop() principalId: string;
}

@Model()
export class BatchPoolIdentity extends Record<BatchPoolIdentityAttributes> {
    @Prop() type: string;
    @ListProp(UserAssignedIdentity) public userAssignedIdentities: List<UserAssignedIdentity>;
}


