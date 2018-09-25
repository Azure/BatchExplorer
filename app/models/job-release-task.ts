import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "moment";

import { TaskContainerSettings, TaskContainerSettingsAttributes } from "./container-setup";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { UserIdentity, UserIdentityAttributes } from "./user-identity";

export interface JobReleaseTaskAttributes {
    id: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    environmentSettings: NameValuePair[];
    maxWallClockTime: Duration;
    retentionTime: Duration;
    runElevated: boolean;
    containerSettings: TaskContainerSettingsAttributes;
    userIdentity: UserIdentityAttributes;
}

/**
 * Class for displaying job release task information.
 */
@Model()
export class JobReleaseTask extends Record<JobReleaseTaskAttributes> {
    @Prop() public id: string;
    @Prop() public commandLine: string;
    @Prop() public resourceFiles: ResourceFile[];
    @Prop() public environmentSettings: NameValuePair[];
    @Prop() public maxWallClockTime: Duration;
    @Prop() public retentionTime: Duration;
    @Prop() public runElevated: boolean;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
}
