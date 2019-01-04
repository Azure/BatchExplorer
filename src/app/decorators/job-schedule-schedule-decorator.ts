import { DateUtils } from "@batch-flask/utils";
import { Schedule } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class JobScheduleScheduleDecorator extends DecoratorBase<Schedule> {
    public doNotRunAfter: string;
    public doNotRunUntil: string;
    public recurrenceInterval: string;
    public startWindow: string;

    constructor(schedule: Schedule) {
        super(schedule);

        this.doNotRunAfter = this.dateField(schedule.doNotRunAfter);
        this.doNotRunUntil = this.dateField(schedule.doNotRunUntil);
        this.recurrenceInterval = DateUtils.prettyDuration(schedule.recurrenceInterval);
        this.startWindow = DateUtils.prettyDuration(schedule.startWindow);
    }
}
