import { Model, Prop, Record } from "@batch-flask/core";
import { TaskContainerSettings, TaskContainerSettingsAttributes } from "./container-setup";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";
import { UserIdentity, UserIdentityAttributes } from "./user-identity";

export interface JobPreparationTaskAttributes {
    id: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    environmentSettings: NameValuePair[];
    constraints: TaskConstraints;
    waitForSuccess: boolean;
    runElevated: boolean;
    rerunOnNodeRebootAfterSuccess: boolean;
    containerSettings: TaskContainerSettingsAttributes;
    userIdentity: UserIdentityAttributes;
}

/**
 * Class for displaying job preparation task information.
 */
@Model()
export class JobPreparationTask extends Record<JobPreparationTaskAttributes> {
    @Prop() public id: string;
    @Prop() public commandLine: string;
    @Prop() public resourceFiles: ResourceFile[];
    @Prop() public environmentSettings: NameValuePair[];
    @Prop() public constraints: TaskConstraints;
    @Prop() public waitForSuccess: boolean;
    @Prop() public runElevated: boolean;
    @Prop() public rerunOnNodeRebootAfterSuccess: boolean;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
}
