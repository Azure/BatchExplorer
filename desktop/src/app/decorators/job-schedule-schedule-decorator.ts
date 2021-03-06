import { DateUtils } from "@batch-flask/utils";
import { Schedule } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class JobScheduleScheduleDecorator extends DecoratorBase<Schedule> {
    public recurrenceInterval: string;
    public startWindow: string;

    constructor(schedule: Schedule) {
        super(schedule);

        this.recurrenceInterval = DateUtils.prettyDuration(schedule.recurrenceInterval);
        this.startWindow = DateUtils.prettyDuration(schedule.startWindow);
    }
}
