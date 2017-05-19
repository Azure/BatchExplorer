import { UserAccountElevationLevel } from "app/models";

export interface UserAccountDto {
    name: string;
    password: string;
    elevationLevel?: UserAccountElevationLevel;
    sshPrivateKey?: string;
}
