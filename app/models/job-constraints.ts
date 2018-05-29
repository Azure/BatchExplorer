import { Model } from "@batch-flask/core";
import { Constraints } from "./constraints";

/**
 * Specifies the execution constraints for jobs created on a schedule.
 */
@Model()
export class JobConstraints extends Constraints {
    constructor(data: any) {
        super(data);
    }
}
