import { Model, Prop, Record, TransformDuration } from "@batch-flask/core";
import { Duration } from "luxon";

export interface ConstraintsAttributes {
    maxTaskRetryCount: Duration;
    maxWallClockTime: number;
}

/**
 * Specifies the execution constraints for tasks or jobs.
 */
@Model()
export class Constraints extends Record<ConstraintsAttributes> {
    @Prop(undefined, TransformDuration) public maxWallClockTime: Duration;
    @Prop() public maxTaskRetryCount: number;
}
