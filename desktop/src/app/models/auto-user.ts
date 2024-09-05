import { Model, Record, Prop } from "@batch-flask/core/record";
import { UserAccountElevationLevel } from "./user-account";

export interface AutoUserSpecificationAttributes {
    scope: AutoUserScope;
    elevationLevel: UserAccountElevationLevel;
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class AutoUserSpecification extends Record<AutoUserSpecificationAttributes> {
    @Prop() public scope: AutoUserScope;

    @Prop() public elevationLevel: UserAccountElevationLevel;
}

export enum AutoUserScope {
    pool = "pool",
    task = "task",
}
