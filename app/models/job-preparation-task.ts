import { Record } from "immutable";

import { NameValuePair } from "app/models/name-value-pair";
import { ResourceFile } from "app/models/resource-file";
import { TaskConstraints } from "app/models/task-constraints";

const JobPreparationTaskRecord = Record({
    id: null,
    commandLine: null,
    resourceFiles: [],
    environmentSettings: [],
    constraints: null,
    waitForSuccess: null,
    runElevated: null,
    rerunOnNodeRebootAfterSuccess: null,
});

/**
 * Class for displaying job preparation task information.
 */
export class JobPreparationTask extends JobPreparationTaskRecord {
    public id: string;
    public commandLine: string;
    public resourceFiles: ResourceFile[];
    public environmentSettings: NameValuePair[];
    public constraints: TaskConstraints;
    public waitForSuccess: boolean;
    public runElevated: boolean;
    public rerunOnNodeRebootAfterSuccess: boolean;
}
