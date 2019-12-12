import { Model, Prop } from "@batch-flask/core";
import { Duration } from "luxon";
import { Constraints } from "./constraints";

/**
 * Specifies the execution constraints for tasks.
 */
@Model()
export class TaskConstraints extends Constraints {
    // server returns "P10675199DT2H48M5.4775807S" for unlimited duration
    @Prop() public retentionTime: Duration;
}
