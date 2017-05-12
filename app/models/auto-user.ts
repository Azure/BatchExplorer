import { Model, Prop, Record } from "app/core";
import { UserAccountElevationLevel } from "./user-account";



export interface AutoUserAttributes {
    scope: AutoUserScope;
    elevationLevel: UserAccountElevationLevel;
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class AutoUser extends Record<AutoUserAttributes> {
    @Prop()
    public scope: AutoUserScope;

    @Prop()
    public elevationLevel: UserAccountElevationLevel;
}

export type AutoUserScope = "pool" | "task";
export const AutoUserScope = {
    pool: "pool" as AutoUserScope,
    task: "task" as AutoUserScope,
};
