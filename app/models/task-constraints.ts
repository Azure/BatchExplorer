import { Duration } from "moment";

import { Constraints } from "./";

/**
 * Specifies the execution constraints for tasks.
 */
export class TaskConstraints extends Constraints {
    public retentionTime: Duration;
}
