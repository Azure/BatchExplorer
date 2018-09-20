import { Model, Prop, Record } from "@batch-flask/core";

export enum UserAccountElevationLevel {
    nonadmin = "nonadmin",
    admin = "admin",
}

export interface UserAccountAttributes {
    name: string;
    elevationLevel: UserAccountElevationLevel;
}

@Model()
export class UserAccount extends Record<UserAccountAttributes> {
    @Prop() public name: string;

    @Prop() public elevationLevel: UserAccountElevationLevel = UserAccountElevationLevel.nonadmin;
}
