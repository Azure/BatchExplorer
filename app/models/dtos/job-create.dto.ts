import { Dto, DtoAttr } from "@batch-flask/core";

import { JobConstraintDto } from "./job-constraints.dto";
import { EnvironmentSetting, MetaDataDto } from "./metadata.dto";
import { PoolCreateDto } from "./pool-create.dto";

export class JobCreateDto extends Dto<JobCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public priority?: number;

    @DtoAttr() public constraints?: JobConstraintDto;

    @DtoAttr() public jobManagerTask?: any;

    @DtoAttr() public jobPreparationTask?: any;

    @DtoAttr() public jobReleaseTask?: any;

    @DtoAttr() public commonEnvironmentSettings?: EnvironmentSetting[];

    @DtoAttr() public poolInfo: {
        poolId?: string;
        autoPoolSpecification: {
            autoPoolIdPrefix?: string;
            poolLifetimeOption?: "job" | "jobschedule";
            keepAlive?: boolean;
            pool?: PoolCreateDto;
        };
    };

    @DtoAttr() public usesTaskDependencies?: boolean;

    @DtoAttr() public onAllTasksComplete?: string;

    @DtoAttr() public onTaskFailure?: string;

    @DtoAttr() public metadata?: MetaDataDto[];
}
