import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { AppPackageReferenceDto } from "./application-package-reference.dto";
import { EnvironmentSetting } from "./metadata.dto";
import { ResourceFileDto } from "./resource-file.dto";
import { TaskConstraintsDto } from "./task-constraints.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";
import { UserIdentityDto } from "./user-identity.dto";

export class GroupSourceDto extends Dto<GroupSourceDto> {
    @DtoAttr() public fileGroup: string;
    @DtoAttr() public prefix: string;
}

export class FileGroupDto extends Dto<FileGroupDto> {
    @DtoAttr() public source: GroupSourceDto;
    @DtoAttr() public filePath: string;
}

export class TaskCreateDto extends Dto<TaskCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public commandLine: string;

    @ListDtoAttr(ResourceFileDto) public resourceFiles?: ResourceFileDto[];

    @DtoAttr() public fileGroups?: FileGroupDto[];

    @ListDtoAttr(AppPackageReferenceDto) public applicationPackageReferences?: AppPackageReferenceDto[];

    @ListDtoAttr(EnvironmentSetting) public environmentSettings?: EnvironmentSetting[];

    @DtoAttr() public affinityInfo?: any;

    @DtoAttr() public constraints?: TaskConstraintsDto;

    @DtoAttr() public userIdentity?: UserIdentityDto;

    @DtoAttr() public multiInstanceSettings?: any;

    @DtoAttr() public dependsOn?: any;

    @DtoAttr() public exitConditions?: any;

    @DtoAttr() public containerSettings?: TaskContainerSettingsDto;
}
