import { Dto, DtoAttr } from "@batch-flask/core";
import { EnvironmentSettingDto } from "./environment-setting.dto";
import { TaskContainerSettingsDto } from "./task-container-settings.dto";
import { ResourceFileDto } from "./task-create.dto";
import { UserIdentityDto } from "./user-identity.dto";

export class StartTaskDto extends Dto<StartTaskDto> {
    @DtoAttr() public commandLine: string;
    @DtoAttr() public containerSettings: TaskContainerSettingsDto;
    @DtoAttr() public environmentSettings: EnvironmentSettingDto[];
    @DtoAttr() public maxTaskRetryCount: number;
    @DtoAttr() public resourceFiles: ResourceFileDto[];
    @DtoAttr() public userIdentity: UserIdentityDto;
    @DtoAttr() public waitForSuccess: boolean;
}
