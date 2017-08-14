import { Model, Prop, Record } from "app/core";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";

export interface JobPreparationTaskAttributes {
    id: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    environmentSettings: NameValuePair[];
    constraints: TaskConstraints;
    waitForSuccess: boolean;
    runElevated: boolean;
    rerunOnNodeRebootAfterSuccess: boolean;
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
}
