import { Model, Prop, Record } from "@bl-common/core";
import { AutoUser } from "./auto-user";

export interface UserIdentityAttributes {
    userName: string;
    autoUser: AutoUser;
}

@Model()
export class UserIdentity extends Record<UserIdentityAttributes> {
    @Prop()
    public userName: string;

    @Prop()
    public autoUser: AutoUser;
}
