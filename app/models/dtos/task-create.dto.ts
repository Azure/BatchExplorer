import { Dto, DtoAttr } from "@batch-flask/core";
import { AppPackageReferenceDto } from "./application-package-reference.dto";
import { EnvironmentSetting } from "./metadata.dto";
import { TaskConstraintsDto } from "./task-constraints.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";

export class TaskCreateDto extends Dto<TaskCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public commandLine: string;

    @DtoAttr() public resourceFiles?: ResourceFileDto[];

    @DtoAttr() public fileGroups?: FileGroupDto[];

    @DtoAttr() public applicationPackageReferences?: AppPackageReferenceDto[];

    @DtoAttr() public environmentSettings?: EnvironmentSetting[];

    @DtoAttr() public affinityInfo?: any;

    @DtoAttr() public constraints?: TaskConstraintsDto;

    @DtoAttr() public userIdentity?: any;

    @DtoAttr() public multiInstanceSettings?: any;

    @DtoAttr() public dependsOn?: any;

    @DtoAttr() public exitConditions?: any;

    @DtoAttr() public containerSettings?: TaskContainerSettingsDto;
}

export interface ResourceFileDto {
    blobSource: string;
    filePath: string;
    fileMode?: string;
}

export interface FileGroupDto {
    source: GroupSourceDto;
    filePath: string;
}

export interface GroupSourceDto {
    fileGroup: string;
    prefix: string;
}
