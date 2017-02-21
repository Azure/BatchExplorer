import { Record } from "immutable";
import { Duration } from "moment";

import { NameValuePair } from "app/models/name-value-pair";
import { ResourceFile } from "app/models/resource-file";

const JobReleaseTaskRecord = Record({
    id: null,
    commandLine: null,
    resourceFiles: [],
    environmentSettings: [],
    maxWallClockTime: null,
    retentionTime: null,
    runElevated: null,
});

/**
 * Class for displaying job release task information.
 */
export class JobReleaseTask extends JobReleaseTaskRecord {
    public id: string;
    public commandLine: string;
    public resourceFiles: ResourceFile[];
    public environmentSettings: NameValuePair[];
    public maxWallClockTime: Duration;
    public retentionTime: Duration;
    public runElevated: boolean;
}
