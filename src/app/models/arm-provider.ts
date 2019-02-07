import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface ArmProviderResourceTypeAttributes {
    alias: any[];
    apiVersion: string[];
    locations: string[];
    properties: any;
    resourceType: string;
}

/**
 * Class for location information
 */
@Model()
export class ArmProviderResourceType extends Record<ArmProviderResourceTypeAttributes> {
    @Prop() public alias: any[];
    @ListProp(String) public apiVersion: List<string>;
    @ListProp(String) public locations: List<string>;
    @Prop() public properties: any;
    @Prop() public resourceType: string;
}

export interface ArmProviderAttributes {
    id: string;
    namespace: string;
    registrationState: string;
    resourceTypes: ArmProviderResourceTypeAttributes[];
}

/**
 * Class for location information
 */
@Model()
export class ArmProvider extends Record<ArmProviderAttributes> {
    @Prop() public id: string;
    @Prop() public namespace: string;
    @Prop() public registrationState: string;
    @ListProp(ArmProviderResourceType) public resourceTypes: List<ArmProviderResourceType>;
}
