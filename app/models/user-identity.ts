import { Model, Prop, Record } from "@batch-flask/core";
import { AutoUser } from "./auto-user";

export interface UserIdentityAttributes {
    username: string;
    autoUser: AutoUser;
}

@Model()
export class UserIdentity extends Record<UserIdentityAttributes> {
    @Prop()
    public username: string;

    @Prop()
    public autoUser: AutoUser;
}
