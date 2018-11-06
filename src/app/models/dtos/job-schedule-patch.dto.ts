import { Dto, DtoAttr } from "@batch-flask/core";
import { MetaDataDto } from "app/models/dtos";
import { JobCreateDto } from "./job-create.dto";
import { ScheduleDto } from "./schedule.dto";

export class JobSchedulePatchDto extends Dto<JobSchedulePatchDto> {
    @DtoAttr() public schedule?: ScheduleDto;

    @DtoAttr() public jobSpecification?: JobCreateDto;

    @DtoAttr() public metadata?: MetaDataDto[];
}
