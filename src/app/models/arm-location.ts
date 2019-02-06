import { Model, Prop, Record } from "@batch-flask/core";

export interface ArmLocationAttributes {
    id: string;
    displayName: string;
    name: string;
    latitude: string;
    longitude: string;
}

/**
 * Class for location information
 */
@Model()
export class ArmLocation extends Record<ArmLocationAttributes> {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public name: string;
    @Prop() public latitude: string;
    @Prop() public longitude: string;
}
