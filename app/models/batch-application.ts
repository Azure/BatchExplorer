import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { ApplicationPackage } from "./application-package";
import { NavigableRecord } from "./navigable-record";

export interface BatchApplicationAttributes {
    id: string;
    displayName: string;
    allowUpdates: boolean;
    defaultVersion: string;
    packages: ApplicationPackage[];
    url: string;
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class BatchApplication extends Record<BatchApplicationAttributes> implements NavigableRecord {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public allowUpdates: boolean = false;
    @Prop() public defaultVersion: string;
    @ListProp(ApplicationPackage) public packages: List<ApplicationPackage> = List([]);
    @Prop() public url: string;

    public get routerLink(): string[] {
        return ["/applications", this.id];
    }
}
