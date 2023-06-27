import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { Duration } from "luxon";
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
    @ListProp(ResourceFile) public resourceFiles: List<ResourceFile> = List([]);
    @ListProp(NameValuePair) public environmentSettings: List<NameValuePair> = List([]);
    @Prop() public maxWallClockTime: Duration;
    @Prop() public retentionTime: Duration;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
}
