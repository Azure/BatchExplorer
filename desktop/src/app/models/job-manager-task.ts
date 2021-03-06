
import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { ApplicationPackageReference } from "./application-package-reference";
import {
    AuthenticationTokenSettings, AuthenticationTokenSettingsAttributes,
} from "./azure-batch/authentication-token-settings";
import { TaskContainerSettings, TaskContainerSettingsAttributes } from "./container-setup";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";
import { TaskOutputFile, TaskOutputFileAttributes } from "./task-output-file";
import { UserIdentity, UserIdentityAttributes } from "./user-identity";

export interface JobManagerTaskAttributes {
    id: string;
    displayName: string;
    commandLine: string;
    resourceFiles: ResourceFile[];
    applicationPackageReferences: ApplicationPackageReference[];
    environmentSettings: NameValuePair[];
    constraints: TaskConstraints;
    requiredSlots: number;
    killJobOnCompletion: boolean;
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
    @ListProp(ResourceFile) public resourceFiles: List<ResourceFile> = List([]);

    @ListProp(ApplicationPackageReference)
    public applicationPackageReferences: List<ApplicationPackageReference> = List([]);

    @ListProp(NameValuePair) public environmentSettings: List<NameValuePair> = List([]);
    @Prop() public constraints: TaskConstraints;
    @Prop() public requiredSlots: number;
    @Prop() public killJobOnCompletion: boolean;
    @Prop() public runExclusive: boolean;
    @Prop() public allowLowPriorityNode: boolean;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public userIdentity: UserIdentity;
    @ListProp(TaskOutputFile) public outputFiles: List<TaskOutputFile> = List([]);
    @Prop() public authenticationTokenSettings: AuthenticationTokenSettings;
}
