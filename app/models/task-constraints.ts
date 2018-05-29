import { Model, Prop, TransformDuration } from "@batch-flask/core";
import { Duration, duration } from "moment";

import { Constraints } from "./constraints";

/**
 * Specifies the execution constraints for tasks.
 */
@Model()
export class TaskConstraints extends Constraints {
    @Prop(duration, TransformDuration) public retentionTime: Duration;
}
