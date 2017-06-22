import { Model, Prop, Record } from "app/core";

export type UserAccountElevationLevel = "nonadmin" | "admin";
export const UserAccountElevationLevel = {
    nonadmin: "nonadmin" as UserAccountElevationLevel,
    admin: "admin" as UserAccountElevationLevel,
};

export interface UserAccountAttributes {
    name: string;
    elevationLevel: UserAccountElevationLevel;
}

@Model()
export class UserAccount extends Record<UserAccountAttributes> {
    @Prop()
    public name: string;

    @Prop()
    public elevationLevel: UserAccountElevationLevel = UserAccountElevationLevel.nonadmin;
}
