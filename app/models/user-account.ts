import { Record } from "immutable";

const UserAccountRecord = Record({
    name: null,
    elevationLevel: "nonAdmin",
});

export interface UserAccountAttributes {
    name: string;
    elevationLevel: UserAccountElevationLevel;
}

export class UserAccount extends UserAccountRecord {
    public name: string;
    public elevationLevel: UserAccountElevationLevel;

    constructor(data: UserAccountAttributes) {
        super(data);
    }
}

export type UserAccountElevationLevel = "nonAdmin" | "admin";
export const UserAccountElevationLevel = {
    nonAdmin: "nonAdmin" as UserAccountElevationLevel,
    admin: "admin" as UserAccountElevationLevel,
};
