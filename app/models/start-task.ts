import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { ResourceFile } from "./resource-file";
import { UserIdentity } from "./user-identity";

export interface StartTaskAttributes {
    commandLine: string;
    userIdentity: any;
    maxTaskRetryCount: number;
    resourceFiles: any[];
    environmentSettings: any[];
}

/**
 * Class for displaying Batch Start Task information.
 */
@Model()
export class StartTask extends Record<StartTaskAttributes> {
    @Prop()
    public commandLine: string;

    @Prop()
    public waitForSuccess: boolean = true;

    @Prop()
    public userIdentity: UserIdentity;

    @Prop()
    public maxTaskRetryCount: number;

    @ListProp(ResourceFile)
    public resourceFiles: List<ResourceFile> = List([]);

    @ListProp(Object)
    public environmentSettings: List<any> = List([]);
}
