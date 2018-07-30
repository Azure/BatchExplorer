import { Dto, DtoAttr } from "@batch-flask/core";
import { UserAccountElevationLevel } from "app/models";

export class UserAccountDto extends Dto<UserAccountDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public password: string;
    @DtoAttr() public elevationLevel?: UserAccountElevationLevel;
    @DtoAttr() public sshPrivateKey?: string;
}
