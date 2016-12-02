import { Duration } from "moment";

/**
 * Specifies the execution constraints for tasks or jobs.
 */
export abstract class Constraints {
    public maxWallClockTime: Duration;
    public maxTaskRetryCount: number;
}
