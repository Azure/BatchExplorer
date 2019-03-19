import { Model, Prop, Record } from "@batch-flask/core";

export enum UserAccountElevationLevel {
    nonadmin = "nonadmin",
    admin = "admin",
}

export enum LoginMode {
    Batch = "batch",
    Interactive = "interactive",
}

export interface WindowsUserConfigurationAttributes {
    loginMode?: LoginMode;
}

@Model()
export class WindowsUserConfiguration extends Record<WindowsUserConfigurationAttributes> {
    @Prop() public loginMode?: LoginMode;
}

export interface LinuxUserConfigurationAttributes {
    gid: number;
    sshPrivateKey: string;
    uid: number;
}

@Model()
export class LinuxUserConfiguration extends Record<LinuxUserConfigurationAttributes> {
    @Prop() public gid: number;
    @Prop() public sshPrivateKey: string;
    @Prop() public uid: number;
}

export interface UserAccountAttributes {
    name: string;
    elevationLevel: UserAccountElevationLevel;
}

@Model()
export class UserAccount extends Record<UserAccountAttributes> {
    @Prop() public name: string;

    @Prop() public password: string;

    @Prop() public elevationLevel: UserAccountElevationLevel = UserAccountElevationLevel.nonadmin;

    @Prop() public linuxUserConfiguration: LinuxUserConfiguration;

    @Prop() public windowsUserConfiguration: WindowsUserConfiguration;
}
