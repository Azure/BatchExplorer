import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "moment";

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
    @Prop() public recurrenceInterval: Duration;
    @Prop() public startWindow: Duration;
}
