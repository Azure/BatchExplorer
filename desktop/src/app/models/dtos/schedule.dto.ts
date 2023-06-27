import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";

export class ScheduleDto extends Dto<ScheduleDto> {
    @DtoAttr() public doNotRunAfter: string;

    @DtoAttr() public doNotRunUntil: string;

    @DtoAttr() public recurrenceInterval: Duration;

    @DtoAttr() public startWindow: Duration;
}
