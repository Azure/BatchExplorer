import { Model, Prop, Record } from "app/core";
import { Duration } from "moment";

import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";

export interface JobReleaseTaskAttributes {
    id: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    environmentSettings: NameValuePair[];
    maxWallClockTime: Duration;
    retentionTime: Duration;
    runElevated: boolean;
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
}
