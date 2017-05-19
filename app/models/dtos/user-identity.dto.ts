import { UserAccountElevationLevel } from "app/models";

export interface UserIdentityDto {
    userName?: string;
    autoUser?: AutoUserDto;
}

export interface AutoUserDto {
    scope?: string;
    elevationLevel?: UserAccountElevationLevel;
}
