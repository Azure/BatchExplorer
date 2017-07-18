import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { ApplicationPackage } from "./application-package";

export interface ApplicationAttributes {
    id: string;
    displayName: string;
    allowUpdates: boolean;
    defaultVersion: string;
    packages: ApplicationPackage[];
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class BatchApplication extends Record<ApplicationAttributes> {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public allowUpdates: boolean = false;
    @Prop() public defaultVersion: string;
    @ListProp(ApplicationPackage) public packages: List<ApplicationPackage> = List([]);
}
