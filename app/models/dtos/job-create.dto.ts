import { EnvironmentSetting, MetaDataDto } from "./metadata.dto";
import { PoolCreateDto } from "./pool-create.dto";

export interface JobCreateDto {
    id: string;
    displayName?: string;
    priority?: number;
    constraints?: any;
    jobManagerTask?: any;
    jobPreparationTask?: any;
    jobReleaseTask?: any;
    commonEnvironmentSettings?: EnvironmentSetting[];
    poolInfo: {
        poolId?: string;
        autoPoolSpecification: {
            autoPoolIdPrefix?: string;
            poolLifetimeOption?: "job" | "jobschedule";
            keepAlive?: boolean;
            pool?: PoolCreateDto;
        };
    };
    usesTaskDependencies?: boolean;
    onAllTasksComplete?: string;
    onTaskFailure?: string;
    metadata?: MetaDataDto[];
}
