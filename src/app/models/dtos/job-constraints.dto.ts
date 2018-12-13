import * as moment from "moment";

import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";

export class JobConstraintDto extends Dto<JobConstraintDto> {
    @DtoAttr(moment.duration) public maxWallClockTime?: Duration;

    @DtoAttr() public maxTaskRetryCount?: number;
}
