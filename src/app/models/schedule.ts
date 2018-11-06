import { Model, Prop, Record } from "@batch-flask/core";
import { Duration, duration } from "moment";

export interface ScheduleAttributes {
    doNotRunAfter: Date;
    doNotRunUntil: Date;
    recurrenceInterval: Duration;
    startWindow: Duration;
}

/**
 * Contains information about the schedule according to which jobs will be created in the Azure
 */
@Model()
export class Schedule extends Record<ScheduleAttributes> {
    @Prop() public doNotRunAfter: Date;
    @Prop() public doNotRunUntil: Date;
    @Prop(duration) public recurrenceInterval: Duration;
    @Prop(duration) public startWindow: Duration;
}
