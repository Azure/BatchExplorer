
import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { ApplicationPackageReference } from "./application-package-reference";
import { TaskContainerSettings, TaskContainerSettingsAttributes } from "./container-setup";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";
import { TaskOutputFile, TaskOutputFileAttributes } from "./task-output-file";
import { UserIdentity, UserIdentityAttributes } from "./user-identity";

export interface AuthenticationTokenSettingsAttributes {
    access: string[];
}

export class AuthenticationTokenSettings extends Record<AuthenticationTokenSettingsAttributes> {
    @ListProp(String) public access: List<string> = List([]);
}

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
    allowLowPriorityNode: boolean;
    runExclusive: boolean;
    containerSettings: TaskContainerSettingsAttributes;
    userIdentity: UserIdentityAttributes;
    outputFiles: TaskOutputFileAttributes[];
    authenticationTokenSettings: AuthenticationTokenSettingsAttributes;
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
    @Prop() public allowLowPriorityNode: boolean;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
    @ListProp(TaskOutputFile) public outputFiles: List<TaskOutputFile> = List([]);
    @Prop() public authenticationTokenSettings: AuthenticationTokenSettings;

}
