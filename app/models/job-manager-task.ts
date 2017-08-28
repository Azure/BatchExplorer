
import { Model, Prop, Record } from "app/core";
import { ApplicationPackageReference } from "./application-package-reference";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";

export interface JobManagerTaskAttributes {
    id: string;
    displayName: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    applicationPackageReferences: ApplicationPackageReference[];
    environmentSettings: NameValuePair[];
    constraints: TaskConstraints;
    killJobOnCompletion: boolean;
    runElevated: boolean;
    runExclusive: boolean;
}
/**
 * Class for displaying job manager task information.
 */
@Model()
export class JobManagerTask extends Record<JobManagerTaskAttributes> {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public commandLine: string;
    @Prop() public resourceFiles: ResourceFile[];
    @Prop() public applicationPackageReferences: ApplicationPackageReference[];
    @Prop() public environmentSettings: NameValuePair[];
    @Prop() public constraints: TaskConstraints;
    @Prop() public killJobOnCompletion: boolean;
    @Prop() public runElevated: boolean;
    @Prop() public runExclusive: boolean;
}
