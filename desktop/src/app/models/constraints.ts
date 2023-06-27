import { Model, Prop, Record } from "@batch-flask/core";
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
    // server returns "P10675199DT2H48M5.4775807S" for unlimited duration
    @Prop() public maxWallClockTime: Duration;
    @Prop() public maxTaskRetryCount: number;
}
