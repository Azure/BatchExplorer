import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { TaskContainerSettings } from "app/models/dtos";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { UserIdentity } from "./user-identity";

export interface StartTaskAttributes {
    commandLine: string;
    userIdentity: any;
    maxTaskRetryCount: number;
    resourceFiles: any[];
    environmentSettings: any[];
    waitForSuccess: boolean;
    containerSettings: TaskContainerSettings;
}

/**
 * Class for displaying Batch Start Task information.
 */
@Model()
export class StartTask extends Record<StartTaskAttributes> {
    @Prop() public commandLine: string;

    @Prop() public waitForSuccess: boolean = true;

    @Prop() public userIdentity: UserIdentity;

    @Prop() public maxTaskRetryCount: number;

    @Prop() public containerSettings: TaskContainerSettings;

    @ListProp(ResourceFile) public resourceFiles: List<ResourceFile> = List([]);

    @ListProp(NameValuePair) public environmentSettings: List<NameValuePair> = List([]);
}
