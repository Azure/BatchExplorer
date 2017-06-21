import { Model, Prop, Record } from "app/core";
import { Duration } from "moment";

export interface ConstraintsAttributes {
    maxTaskRetryCount: Duration;
    maxWallClockTime: number;
}

/**
 * Specifies the execution constraints for tasks or jobs.
 */
@Model()
export class Constraints extends Record<ConstraintsAttributes> {
    @Prop() public maxWallClockTime: any;
    @Prop() public maxTaskRetryCount: number;
}
