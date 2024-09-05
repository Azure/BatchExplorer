import { Model, Record, Prop } from "@batch-flask/core/record";
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
