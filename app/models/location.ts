import { Model, Prop, Record } from "@batch-flask/core";

export interface LocationAttributes {
    id: string;
    subscriptionId: string;
    displayName: string;
    name: string;
    latitude: string;
    longitude: string;
}

/**
 * Class for location information
 */
@Model()
export class Location extends Record<LocationAttributes> {
    @Prop() public id: string;
    @Prop() public subscriptionId: string;
    @Prop() public displayName: string;
    @Prop() public name: string;
    @Prop() public latitude: string;
    @Prop() public longitude: string;
}
