import { Model, Prop, TransformDuration } from "@batch-flask/core";
import { Duration } from "luxon";
import { Constraints } from "./constraints";

/**
 * Specifies the execution constraints for tasks.
 */
@Model()
export class TaskConstraints extends Constraints {
    @Prop(undefined, TransformDuration) public retentionTime: Duration;
}
