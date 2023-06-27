import { Model, Prop, Record } from "@batch-flask/core";
import { AutoUserSpecification, AutoUserSpecificationAttributes } from "./auto-user";

export interface UserIdentityAttributes {
    username?: string;
    autoUser?: AutoUserSpecificationAttributes;
}

@Model()
export class UserIdentity extends Record<UserIdentityAttributes> {
    @Prop() public username: string;

    @Prop() public autoUser: AutoUserSpecification;
}
