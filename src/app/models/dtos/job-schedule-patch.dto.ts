import { Dto, DtoAttr } from "@batch-flask/core";
import { JobCreateDto } from "./job-create.dto";
import { MetaDataDto } from "./metadata.dto";
import { ScheduleDto } from "./schedule.dto";

export class JobSchedulePatchDto extends Dto<JobSchedulePatchDto> {
    @DtoAttr() public schedule?: ScheduleDto;

    @DtoAttr() public jobSpecification?: JobCreateDto;

    @DtoAttr() public metadata?: MetaDataDto[];
}
