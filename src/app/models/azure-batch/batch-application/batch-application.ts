import { ArmRecord, Model, NavigableRecord, Prop, Record } from "@batch-flask/core";

export interface BatchApplicationPropertiesAttributes {
    allowUpdates: boolean;
    defaultVersion: string;
    displayName: string;
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class BatchApplicationProperties extends Record<BatchApplicationPropertiesAttributes> {
    @Prop() public allowUpdates: boolean = false;
    @Prop() public defaultVersion: string;
    @Prop() public displayName: string;
}

export interface BatchApplicationAttributes {
    id: string;
    eTag: string;
    name: string;
    properties: BatchApplicationPropertiesAttributes;
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class BatchApplication extends ArmRecord<BatchApplicationAttributes> implements NavigableRecord {
    @Prop() public id: string;
    @Prop() public eTag: string;
    @Prop() public name: string;
    @Prop() public url: string;
    @Prop() public properties: BatchApplicationProperties;

    public get routerLink(): string[] {
        return ["/applications", this.id];
    }

    public get uid() {
        return "/applications/" + this.id;
    }
}
