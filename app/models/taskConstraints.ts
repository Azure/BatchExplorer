import { Constraints } from "./constraints";
import { Duration } from "moment";

/**
 * Specifies the execution constraints for tasks.
 */
export class TaskConstraints extends Constraints {
    public retentionTime: Duration;
}
