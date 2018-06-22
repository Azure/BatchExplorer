import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { ExitOptions } from "../task-exit-conditions";
import { AppPackageReferenceDto } from "./application-package-reference.dto";
import { EnvironmentSetting } from "./metadata.dto";
import { ResourceFileDto } from "./resource-file.dto";
import { TaskConstraintsDto } from "./task-constraints.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";
import { UserIdentityDto } from "./user-identity.dto";

export class AffinityInfoDto extends Dto<AffinityInfoDto> {
    @DtoAttr() public affinityId: string;
}

export class MultiInstanceSettingsDto extends Dto<MultiInstanceSettingsDto> {
    @DtoAttr() public coordinationCommandLine: string;
    @DtoAttr() public numberOfInstances: number;
    @ListDtoAttr(ResourceFileDto) public commonResourceFiles: ResourceFileDto[];
}

export class TaskIdRangeDto extends Dto<TaskIdRangeDto> {
    @DtoAttr() public start: number;
    @DtoAttr() public end: number;
}

export class TaskDependenciesDto extends Dto<TaskDependenciesDto> {
    @ListDtoAttr(Number) public taskIds: number[];
    @ListDtoAttr(TaskIdRangeDto) public taskIdRanges: TaskIdRangeDto[];
}

export class GroupSourceDto extends Dto<GroupSourceDto> {
    @DtoAttr() public fileGroup: string;
    @DtoAttr() public prefix: string;
}

export class FileGroupDto extends Dto<FileGroupDto> {
    @DtoAttr() public source: GroupSourceDto;
    @DtoAttr() public filePath: string;
}

export class ExitCodeRangeMappingDto extends Dto<ExitCodeRangeMappingDto> {
    @DtoAttr() public start: number;
    @DtoAttr() public end: number;
    @DtoAttr() public exitOptions: ExitOptions;
}

export class ExitCodeMappingDto extends Dto<ExitCodeMappingDto> {
    @DtoAttr() public code: number;
    @DtoAttr() public exitOptions: ExitOptions;
}

export class ExitConditionsDto extends Dto<ExitConditionsDto> {
    @DtoAttr() public default: ExitOptions;
    @DtoAttr() public exitCodeRanges: ExitCodeRangeMappingDto;
    @DtoAttr() public exitCodes: ExitCodeMappingDto;
    @DtoAttr() public fileUploadError: ExitOptions;
    @DtoAttr() public preProcessingError: ExitOptions;
}

export class TaskCreateDto extends Dto<TaskCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public commandLine: string;

    @ListDtoAttr(ResourceFileDto) public resourceFiles?: ResourceFileDto[];

    @DtoAttr() public fileGroups?: FileGroupDto[];

    @ListDtoAttr(AppPackageReferenceDto) public applicationPackageReferences?: AppPackageReferenceDto[];

    @ListDtoAttr(EnvironmentSetting) public environmentSettings?: EnvironmentSetting[];

    @DtoAttr() public affinityInfo?: AffinityInfoDto;

    @DtoAttr() public constraints?: TaskConstraintsDto;

    @DtoAttr() public userIdentity?: UserIdentityDto;

    @DtoAttr() public multiInstanceSettings?: MultiInstanceSettingsDto;

    @DtoAttr() public dependsOn?: TaskDependenciesDto;

    @DtoAttr() public exitConditions?: ExitConditionsDto;

    @DtoAttr() public containerSettings?: TaskContainerSettingsDto;
}
