import { Model, Prop, Record } from "@batch-flask/core";
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

export enum AutoUserScope {
    pool = "pool",
    task = "task",
}
