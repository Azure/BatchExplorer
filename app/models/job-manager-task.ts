import { Record } from "immutable";

import { ApplicationPackageReference } from "./application-package-reference";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";

const JobManagerTaskRecord = Record({
    id: null,
    displayName: null,
    commandLine: null,
    resourceFiles: [],
    applicationPackageReferences: null,
    environmentSettings: null,
    constraints: null,
    killJobOnCompletion: null,
    runElevated: null,
    runExclusive: null,
});

/**
 * Class for displaying job manager task information.
 */
export class JobManagerTask extends JobManagerTaskRecord {
    public id: string;
    public displayName: string;
    public commandLine: string;
    public resourceFiles: ResourceFile[];
    public applicationPackageReferences: ApplicationPackageReference[];
    public environmentSettings: NameValuePair[];
    public constraints: TaskConstraints;
    public killJobOnCompletion: boolean;
    public runElevated: boolean;
    public runExclusive: boolean;
}
