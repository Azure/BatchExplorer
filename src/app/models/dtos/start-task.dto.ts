import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { EnvironmentSettingDto } from "./environment-setting.dto";
import { ResourceFileDto } from "./resource-file.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";
import { UserIdentityDto } from "./user-identity.dto";

export class StartTaskDto extends Dto<StartTaskDto> {
    @DtoAttr() public commandLine: string;
    @DtoAttr() public containerSettings?: TaskContainerSettingsDto;
    @ListDtoAttr(EnvironmentSettingDto) public environmentSettings?: EnvironmentSettingDto[];
    @DtoAttr() public maxTaskRetryCount?: number;
    @ListDtoAttr(ResourceFileDto) public resourceFiles?: ResourceFileDto[];
    @DtoAttr() public userIdentity?: UserIdentityDto;
    @DtoAttr() public waitForSuccess?: boolean;
}
