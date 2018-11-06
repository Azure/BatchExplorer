import { Dto, DtoAttr } from "@batch-flask/core";
import { UserAccountElevationLevel } from "app/models";

export class AutoUserDto extends Dto<AutoUserDto> {
    @DtoAttr() public scope?: string;
    @DtoAttr() public elevationLevel?: UserAccountElevationLevel;
}

export class UserIdentityDto extends Dto<UserIdentityDto> {
    @DtoAttr() public username?: string;
    @DtoAttr() public autoUser?: AutoUserDto;
}
