import { UserAccountElevationLevel } from "app/models";

export interface UserIdentityDto {
    username?: string;
    autoUser?: AutoUserDto;
}

export interface AutoUserDto {
    scope?: string;
    elevationLevel?: UserAccountElevationLevel;
}
