import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
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
    @ListProp(ResourceFile) public resourceFiles: List<ResourceFile> = List([]);
    @ListProp(NameValuePair) public environmentSettings: List<NameValuePair> = List([]);
    @Prop() public constraints: TaskConstraints;
    @Prop() public waitForSuccess: boolean;
    @Prop() public rerunOnNodeRebootAfterSuccess: boolean;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
}
