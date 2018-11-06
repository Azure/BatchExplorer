import * as moment from "moment";

import { Dto, DtoAttr } from "@batch-flask/core";

export class ScheduleDto extends Dto<ScheduleDto> {
    @DtoAttr() public doNotRunAfter: string;

    @DtoAttr() public doNotRunUntil: string;

    @DtoAttr(moment.duration) public recurrenceInterval: moment.Duration;

    @DtoAttr(moment.duration) public startWindow: moment.Duration;
}
