import { Dto, DtoAttr } from "@batch-flask/core";
import { LoginMode, UserAccountElevationLevel } from "../user-account";

export class WindowsUserConfigurationDto extends Dto<UserAccountDto> {
    @DtoAttr() public loginMode?: LoginMode;
}

export class LinuxUserConfigurationDto extends Dto<UserAccountDto> {
    @DtoAttr() public gid?: number;
    @DtoAttr() public uid?: number;
    @DtoAttr() public sshPrivateKey?: string;
}

export class UserAccountDto extends Dto<UserAccountDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public password: string;
    @DtoAttr() public elevationLevel?: UserAccountElevationLevel;
    @DtoAttr() public linuxUserConfiguration?: LinuxUserConfigurationDto;
    @DtoAttr() public windowsUserConfiguration?: WindowsUserConfigurationDto;
}
