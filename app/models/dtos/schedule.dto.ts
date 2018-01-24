import { Dto, DtoAttr } from "app/core";
import { Duration } from "moment";

export class ScheduleDto extends Dto<ScheduleDto> {
    @DtoAttr() public doNotRunAfter: Date;

    @DtoAttr() public doNotRunUntil: Date;

    @DtoAttr() public recurrenceInterval: Duration;

    @DtoAttr() public startWindow: Duration;
}
