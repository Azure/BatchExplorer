import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";

import { ApplicationPackageReference } from "../application-package-reference";
import { EnvironmentSettingDto } from "./environment-setting.dto";
import { JobConstraintDto } from "./job-constraints.dto";
import { EnvironmentSetting, MetaDataDto } from "./metadata.dto";
import { OutputFileDto } from "./output-file.dto";
import { PoolCreateDto } from "./pool-create.dto";
import { ResourceFileDto } from "./resource-file.dto";
import { TaskConstraintsDto } from "./task-constraints.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";
import { UserIdentityDto } from "./user-identity.dto";

export class AuthenticationTokenSettingsDto extends Dto<AuthenticationTokenSettingsDto> {
    @ListDtoAttr(String) public outputFiles: string[];
}

export class JobManagerTaskDto extends Dto<JobPreparationTaskDto> {
    @DtoAttr() public id: string;
    @DtoAttr() public runExclusive: boolean;
    @DtoAttr() public displayName: string;
    @DtoAttr() public commandLine: string;
    @DtoAttr() public allowLowPriorityNode: boolean;
    @DtoAttr() public killJobOnCompletion: boolean;
    @DtoAttr() public constraints: TaskConstraintsDto;
    @DtoAttr() public containerSettings: TaskContainerSettingsDto;
    @DtoAttr() public userIdentity: UserIdentityDto;
    @DtoAttr() public authenticationTokenSettings: AuthenticationTokenSettingsDto;
    @ListDtoAttr(EnvironmentSettingDto) public environmentSettings: EnvironmentSettingDto[];
    @ListDtoAttr(ResourceFileDto) public resourceFiles: ResourceFileDto[];
    @ListDtoAttr(ApplicationPackageReference) public applicationPackageReferences: ApplicationPackageReference[];
    @ListDtoAttr(OutputFileDto) public outputFiles: OutputFileDto[];
}

export class JobPreparationTaskDto extends Dto<JobPreparationTaskDto> {
    @DtoAttr() public id: string;
    @DtoAttr() public commandLine: string;
    @DtoAttr() public rerunOnNodeRebootAfterSuccess: boolean;
    @DtoAttr() public waitForSuccess: boolean;
    @DtoAttr() public constraints: TaskConstraintsDto;
    @DtoAttr() public containerSettings: TaskContainerSettingsDto;
    @DtoAttr() public userIdentity: UserIdentityDto;
    @ListDtoAttr(EnvironmentSettingDto) public environmentSettings: EnvironmentSettingDto[];
    @ListDtoAttr(ResourceFileDto) public resourceFiles: ResourceFileDto[];
}

export class JobReleaseTaskDto extends Dto<JobPreparationTaskDto> {
    @DtoAttr() public id: string;
    @DtoAttr() public commandLine: string;
    @DtoAttr() public maxWallClockTime: string;
    @DtoAttr() public retentionTime: string;
    @DtoAttr() public containerSettings: TaskContainerSettingsDto;
    @DtoAttr() public userIdentity: UserIdentityDto;
    @ListDtoAttr(ResourceFileDto) public resourceFiles: ResourceFileDto[];
    @ListDtoAttr(EnvironmentSettingDto) public environmentSettings: EnvironmentSettingDto[];
}

export class JobCreateDto extends Dto<JobCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public priority?: number;

    @DtoAttr() public constraints?: JobConstraintDto;

    @DtoAttr() public jobManagerTask?: JobManagerTaskDto;

    @DtoAttr() public jobPreparationTask?: JobPreparationTaskDto;

    @DtoAttr() public jobReleaseTask?: JobReleaseTaskDto;

    @ListDtoAttr(EnvironmentSetting) public commonEnvironmentSettings?: EnvironmentSetting[];

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

    @ListDtoAttr(MetaDataDto) public metadata?: MetaDataDto[];
}
